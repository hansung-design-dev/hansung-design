import axios from 'axios';
import crypto from 'crypto';
import iconv from 'iconv-lite';
import { isNiceDebugEnabled, resolveEgressIpForDebug } from './niceDebug';

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
      const debugEnabled = isNiceDebugEnabled();
      // #region agent log (hypothesis A/B/C)
      fetch(
        'http://127.0.0.1:7242/ingest/de0826ba-4e91-43eb-b001-5614ace69b75',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'src/lib/NiceAuthHandler.ts:getEncryptionToken:entry',
            message: 'getEncryptionToken entry',
            data: {
              debugEnabled,
              clientIdPrefix4: String(this.clientId || '').slice(0, 4),
              clientIdLen: String(this.clientId || '').length,
              productIdPrefix4: String(this.productId || '').slice(0, 4),
              productIdLen: String(this.productId || '').length,
              reqNoLen: String(reqNo || '').length,
            },
            timestamp: Date.now(),
            sessionId: 'debug-session',
            runId: 'pre-fix',
            hypothesisId: 'A/B/C',
          }),
        }
      ).catch(() => {});
      // #endregion

      if (debugEnabled) {
        const ip = await resolveEgressIpForDebug();
        // #region agent log (hypothesis A/C)
        fetch(
          'http://127.0.0.1:7242/ingest/de0826ba-4e91-43eb-b001-5614ace69b75',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              location:
                'src/lib/NiceAuthHandler.ts:getEncryptionToken:egress-ip',
              message: 'resolved egress ip (best-effort)',
              data: {
                ok: ip.ok,
                status: ip.status,
                ip: ip.ip,
                hasError: 'error' in ip,
              },
              timestamp: Date.now(),
              sessionId: 'debug-session',
              runId: 'pre-fix',
              hypothesisId: 'A/C',
            }),
          }
        ).catch(() => {});
        // #endregion
      }

      const authorization = Buffer.from(
        `${this.accessToken}:${currentTimestamp}:${this.clientId}`
      ).toString('base64');
      const response = await axios({
        method: 'POST',
        url: 'https://svc.niceapi.co.kr:22001/digital/niceid/api/v1.0/common/crypto/token',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authorization}`,
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
      // NOTE: 민감정보(token_val 등) 포함 가능성 때문에 운영에서는 전체 응답 로깅 지양
      console.log('[NiceAuthHandler] crypto token response summary', {
        gwResult: resData?.dataHeader?.GW_RSLT_CD,
        rspCd: resData?.dataBody?.rsp_cd,
        hasTokenVersionId: Boolean(resData?.dataBody?.token_version_id),
      });
      // #region agent log (hypothesis A/B)
      fetch(
        'http://127.0.0.1:7242/ingest/de0826ba-4e91-43eb-b001-5614ace69b75',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'src/lib/NiceAuthHandler.ts:getEncryptionToken:response',
            message: 'crypto token response summary',
            data: {
              gwResult: resData?.dataHeader?.GW_RSLT_CD ?? null,
              rspCd: resData?.dataBody?.rsp_cd ?? null,
              hasTokenVersionId: Boolean(resData?.dataBody?.token_version_id),
            },
            timestamp: Date.now(),
            sessionId: 'debug-session',
            runId: 'pre-fix',
            hypothesisId: 'A/B',
          }),
        }
      ).catch(() => {});
      // #endregion
      if (
        resData?.dataHeader?.GW_RSLT_CD !== '1200' ||
        resData?.dataBody?.rsp_cd !== 'P000'
      ) {
        throw new Error(
          `Failed to request crypto token: GW_RSLT_CD=${
            resData?.dataHeader?.GW_RSLT_CD ?? 'null'
          } rsp_cd=${resData?.dataBody?.rsp_cd ?? 'null'}`
        );
      }
      return {
        siteCode: resData.dataBody.site_code as string,
        tokenVal: resData.dataBody.token_val as string,
        tokenVersionId: resData.dataBody.token_version_id as string,
      };
    } catch (error) {
      const err = error as unknown;
      if (typeof err === 'object' && err && 'response' in err) {
        const e = err as {
          response?: { status?: number; statusText?: string; data?: unknown };
          message?: string;
        };
        const status = e.response?.status;
        const statusText = e.response?.statusText;
        const data = e.response?.data;
        console.error('[NiceAuthHandler] crypto token axios error', {
          status,
          statusText,
          data,
        });
        // #region agent log (hypothesis A/B/C)
        fetch(
          'http://127.0.0.1:7242/ingest/de0826ba-4e91-43eb-b001-5614ace69b75',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              location:
                'src/lib/NiceAuthHandler.ts:getEncryptionToken:axios-error',
              message: 'axios error from NICE crypto token',
              data: {
                status: status ?? null,
                statusText: statusText ?? null,
                hasData: Boolean(data),
              },
              timestamp: Date.now(),
              sessionId: 'debug-session',
              runId: 'pre-fix',
              hypothesisId: 'A/B/C',
            }),
          }
        ).catch(() => {});
        // #endregion
        throw new Error(
          `Failed to get encryption token (axios): ${status ?? ''} ${
            statusText ?? ''
          } ${data ? JSON.stringify(data) : ''}`.trim()
        );
      }
      console.error('[NiceAuthHandler] crypto token error', error);
      // #region agent log (hypothesis A/B/C)
      fetch(
        'http://127.0.0.1:7242/ingest/de0826ba-4e91-43eb-b001-5614ace69b75',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location:
              'src/lib/NiceAuthHandler.ts:getEncryptionToken:unknown-error',
            message: 'non-axios error in getEncryptionToken',
            data: {
              isError: error instanceof Error,
              name: error instanceof Error ? error.name : null,
              message:
                error instanceof Error
                  ? String(error.message).slice(0, 240)
                  : null,
            },
            timestamp: Date.now(),
            sessionId: 'debug-session',
            runId: 'pre-fix',
            hypothesisId: 'A/B/C',
          }),
        }
      ).catch(() => {});
      // #endregion
      throw new Error(
        error instanceof Error
          ? error.message
          : 'Failed to get encryption token'
      );
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
