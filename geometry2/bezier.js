function mix(a, b, t) {
    return a * (1 - t) + b * t;
}

// hitung titik di kurva bezier
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

// Menghitung turunan/garis singgung (tangent) dari kurva bezier
export function getBezierTangent(t, p0, p1, p2, p3) {
    // Rumus turunan kurva bezier kubik:
    // B'(t) = 3(1-t)^2 (P1-P0) + 6(1-t)t (P2-P1) + 3t^2 (P3-P2)
    const t2 = t * t;
    const one_minus_t = 1 - t;
    const one_minus_t_2 = one_minus_t * one_minus_t;

    const term1_x = 3 * one_minus_t_2 * (p1[0] - p0[0]);
    const term1_y = 3 * one_minus_t_2 * (p1[1] - p0[1]);

    const term2_x = 6 * one_minus_t * t * (p2[0] - p1[0]);
    const term2_y = 6 * one_minus_t * t * (p2[1] - p1[1]);

    const term3_x = 3 * t2 * (p3[0] - p2[0]);
    const term3_y = 3 * t2 * (p3[1] - p2[1]);

    const final_x = term1_x + term2_x + term3_x;
    const final_y = term1_y + term2_y + term3_y;

    return { x: final_x, y: final_y };
}
