function mix(a, b, t) {
    return a * (1 - t) + b * t;
}

export function getBezierPoint(t, p0, p1, p2, p3) {
    const ab_x = mix(p0[0], p1[0], t);
    const ab_y = mix(p0[1], p1[1], t);
    const bc_x = mix(p1[0], p2[0], t);
    const bc_y = mix(p1[1], p2[1], t);
    const cd_x = mix(p2[0], p3[0], t);
    const cd_y = mix(p2[1], p3[1], t);
    const abbc_x = mix(ab_x, bc_x, t);
    const abbc_y = mix(ab_y, bc_y, t);
    const bccd_x = mix(bc_x, cd_x, t);
    const bccd_y = mix(bc_y, cd_y, t);
    const final_x = mix(abbc_x, bccd_x, t);
    const final_y = mix(abbc_y, bccd_y, t);
    return { x: final_x, y: final_y };
}

// HITUNG-HITUNGAN TURUNAN DAN GARIS SINGGUNG BEZIER
export function getBezierTangent(t, p0, p1, p2, p3) {
    const dt = 1.0 - t;
    const dt2 = dt * dt;
    const t2 = t * t;

    const tx = 3 * dt2 * (p1[0] - p0[0]) + 6 * dt * t * (p2[0] - p1[0]) + 3 * t2 * (p3[0] - p2[0]);
    const ty = 3 * dt2 * (p1[1] - p0[1]) + 6 * dt * t * (p2[1] - p1[1]) + 3 * t2 * (p3[1] - p2[1]);
    
    // NORMALISASI
    const len = Math.sqrt(tx * tx + ty * ty) || 1;
    return { x: tx / len, y: ty / len };
}