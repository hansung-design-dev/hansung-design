/**
 * Convex Hull 계산 유틸리티
 * Graham Scan 알고리즘을 사용하여 점들의 볼록 껍질을 계산합니다.
 */

interface Point {
  lat: number;
  lng: number;
}

/**
 * 두 점 사이의 거리 제곱을 계산합니다
 */
function getDistanceSquared(p1: Point, p2: Point): number {
  const dx = p1.lng - p2.lng;
  const dy = p1.lat - p2.lat;
  return dx * dx + dy * dy;
}

/**
 * 세 점의 외적을 계산합니다 (시계 방향/반시계 방향 판단)
 */
function crossProduct(p0: Point, p1: Point, p2: Point): number {
  return (
    (p1.lng - p0.lng) * (p2.lat - p0.lat) -
    (p1.lat - p0.lat) * (p2.lng - p0.lng)
  );
}

/**
 * Convex Hull을 계산합니다 (Graham Scan 알고리즘)
 * @param points 좌표 배열
 * @param padding 경계선에 추가할 패딩 (선택적)
 * @returns Convex Hull을 구성하는 점들의 배열
 */
export function calculateConvexHull(
  points: Point[],
  padding: number = 0
): Point[] {
  if (points.length < 3) {
    // 점이 3개 미만이면 사각형으로 반환
    if (points.length === 0) return [];
    if (points.length === 1) {
      const p = points[0];
      return [
        { lat: p.lat - padding, lng: p.lng - padding },
        { lat: p.lat - padding, lng: p.lng + padding },
        { lat: p.lat + padding, lng: p.lng + padding },
        { lat: p.lat + padding, lng: p.lng - padding },
      ];
    }
    if (points.length === 2) {
      const p1 = points[0];
      const p2 = points[1];
      const midLat = (p1.lat + p2.lat) / 2;
      const midLng = (p1.lng + p2.lng) / 2;
      const latDiff = Math.abs(p1.lat - p2.lat) / 2 + padding;
      const lngDiff = Math.abs(p1.lng - p2.lng) / 2 + padding;
      return [
        { lat: midLat - latDiff, lng: midLng - lngDiff },
        { lat: midLat - latDiff, lng: midLng + lngDiff },
        { lat: midLat + latDiff, lng: midLng + lngDiff },
        { lat: midLat + latDiff, lng: midLng - lngDiff },
      ];
    }
  }

  // 1. 가장 아래쪽(그 다음 왼쪽) 점을 찾습니다
  let bottomPoint = points[0];
  let bottomIndex = 0;
  for (let i = 1; i < points.length; i++) {
    if (
      points[i].lat < bottomPoint.lat ||
      (points[i].lat === bottomPoint.lat && points[i].lng < bottomPoint.lng)
    ) {
      bottomPoint = points[i];
      bottomIndex = i;
    }
  }

  // 2. 기준점을 기준으로 각도와 거리로 정렬
  const sortedPoints = points
    .map((point, index) => ({
      point,
      index,
      angle:
        index === bottomIndex
          ? -Infinity
          : Math.atan2(
              point.lat - bottomPoint.lat,
              point.lng - bottomPoint.lng
            ),
      distance:
        index === bottomIndex
          ? 0
          : getDistanceSquared(point, bottomPoint),
    }))
    .sort((a, b) => {
      if (a.index === bottomIndex) return -1;
      if (b.index === bottomIndex) return 1;
      if (Math.abs(a.angle - b.angle) < 1e-10) {
        return a.distance - b.distance;
      }
      return a.angle - b.angle;
    })
    .map((item) => item.point);

  // 3. Graham Scan으로 Convex Hull 계산
  const hull: Point[] = [sortedPoints[0], sortedPoints[1]];

  for (let i = 2; i < sortedPoints.length; i++) {
    while (
      hull.length > 1 &&
      crossProduct(
        hull[hull.length - 2],
        hull[hull.length - 1],
        sortedPoints[i]
      ) <= 0
    ) {
      hull.pop();
    }
    hull.push(sortedPoints[i]);
  }

  // 4. 패딩 적용 (경계선을 약간 확장)
  if (padding > 0) {
    // 중심점 계산
    const centerLat =
      hull.reduce((sum, p) => sum + p.lat, 0) / hull.length;
    const centerLng =
      hull.reduce((sum, p) => sum + p.lng, 0) / hull.length;

    // 각 점을 중심점에서 멀어지도록 이동
    return hull.map((point) => {
      const dx = point.lng - centerLng;
      const dy = point.lat - centerLat;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance === 0) return point;
      const scale = (distance + padding) / distance;
      return {
        lat: centerLat + (point.lat - centerLat) * scale,
        lng: centerLng + (point.lng - centerLng) * scale,
      };
    });
  }

  return hull;
}

