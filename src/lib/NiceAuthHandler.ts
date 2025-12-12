import axios from 'axios';
import crypto from 'crypto';
import iconv from 'iconv-lite';

export class NiceAuthHandler {
  private clientId: string;
  private accessToken: string;
  private productId: string;

  constructor(clientId: string, accessToken: string, productId: string) {
    this.clientId = clientId;
    this.accessToken = accessToken;
    this.productId = productId;
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }

  static async getAccessToken(clientId: string, clientSecret: string) {
    const authorization = Buffer.from(`${clientId}:${clientSecret}`).toString(
      'base64'
    );
    const dataBody = new URLSearchParams({
      scope: 'default',
      grant_type: 'client_credentials',
    }).toString();
    const response = await axios({
      method: 'POST',
      url: 'https://svc.niceapi.co.kr:22001/digital/niceid/oauth/oauth/token',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${authorization}`,
      },
      data: dataBody,
    });
    return response.data.dataBody.access_token;
  }

  async getEncryptionToken(
    reqDtim: string,
    currentTimestamp: number,
    reqNo: string
  ) {
    try {
      const authorization = Buffer.from(
        `${this.accessToken}:${currentTimestamp}:${this.clientId}`
      ).toString('base64');
      const response = await axios({
        method: 'POST',
        url: 'https://svc.niceapi.co.kr:22001/digital/niceid/api/v1.0/common/crypto/token',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `bearer ${authorization}`,
          client_id: this.clientId,
          productID: this.productId,
        },
        data: {
          dataHeader: {
            CNTY_CD: 'ko',
          },
          dataBody: {
            req_dtim: reqDtim,
            req_no: reqNo,
            enc_mode: '1',
          },
        },
      });
      const resData = response.data;
      console.log(
        '[NiceAuthHandler] crypto token response',
        JSON.stringify(resData)
      );
      if (
        resData.dataHeader.GW_RSLT_CD !== '1200' &&
        resData.dataBody.rsp_cd !== 'P000'
      ) {
        throw new Error(
          `Failed to request crypto token: ${resData.dataBody.rsp_cd}`
        );
      }
      return {
        siteCode: resData.dataBody.site_code as string,
        tokenVal: resData.dataBody.token_val as string,
        tokenVersionId: resData.dataBody.token_version_id as string,
      };
    } catch (error) {
      console.error(error);
      throw new Error('Failed to get encryption token');
    }
  }

  generateSymmetricKey(reqDtim: string, reqNo: string, tokenVal: string) {
    if (!reqDtim || !reqNo || !tokenVal) {
      throw new Error('Empty parameter');
    }
    const value = reqDtim.trim() + reqNo.trim() + tokenVal.trim();
    const hash = crypto.createHash('sha256').update(value).digest('base64');
    return {
      key: hash.slice(0, 16),
      iv: hash.slice(-16),
      hmacKey: hash.slice(0, 32),
    };
  }

  encryptData(data: unknown, key: string, iv: string) {
    if (!data || !key || !iv) {
      throw new Error('Empty parameter');
    }
    const strData = JSON.stringify(data).trim();
    const cipher = crypto.createCipheriv(
      'aes-128-cbc',
      Buffer.from(key),
      Buffer.from(iv)
    );
    let encrypted = cipher.update(strData, 'utf-8', 'base64');
    encrypted += cipher.final('base64');
    return encrypted;
  }

  hmac256(data: string, hmacKey: string) {
    if (!data || !hmacKey) {
      throw new Error('Empty parameter');
    }
    const hmac = crypto.createHmac('sha256', Buffer.from(hmacKey));
    hmac.update(Buffer.from(data));
    return hmac.digest().toString('base64');
  }

  decryptData(data: string, key: string, iv: string) {
    if (!data || !key || !iv) {
      throw new Error('Empty parameter');
    }
    const decipher = crypto.createDecipheriv(
      'aes-128-cbc',
      Buffer.from(key),
      Buffer.from(iv)
    );
    let decrypted = decipher.update(data, 'base64', 'binary');
    decrypted += decipher.final('binary');
    const decoded = iconv.decode(Buffer.from(decrypted, 'binary'), 'euc-kr');
    return JSON.parse(decoded);
  }
}
