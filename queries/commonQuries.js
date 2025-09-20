export const loginUserQuery = () => {
    return `
        SELECT
            u.id,
            u.role,
            u.phone,
            u.uid,
            u.active_profile_id,
            u.created_at,
            JSON_OBJECT(
                    'id', p.id,
                    'user_id', p.user_id,
                    'role', p.role,
                    'full_name', p.full_name,
                    'due_date', p.due_date,
                    'father_name', p.father_name,
                    'first_pregnancy', p.first_pregnancy,
                    'last_period_date', p.last_period_date,
                    'cycle_length', p.cycle_length,
                    'period_length', p.period_length,
                    'created_at', p.created_at
            ) as profile
        FROM app_user u
                 LEFT JOIN profile p ON p.id = u.active_profile_id
        WHERE u.phone = ? AND u.otp = ?;
    `;
};

export const getUserByIdQuery = () => {
    return `
        SELECT
            u.id,
            u.role,
            u.phone,
            u.uid,
            u.active_profile_id,
            u.created_at,
            JSON_OBJECT(
                    'id', p.id,
                    'user_id', p.user_id,
                    'role', p.role,
                    'full_name', p.full_name,
                    'due_date', p.due_date,
                    'father_name', p.father_name,
                    'first_pregnancy', p.first_pregnancy,
                    'last_period_date', p.last_period_date,
                    'cycle_length', p.cycle_length,
                    'period_length', p.period_length,
                    'created_at', p.created_at
            ) as profile
        FROM app_user u
                 LEFT JOIN profile p ON p.id = u.active_profile_id
        WHERE u.id = ?
    `;
};