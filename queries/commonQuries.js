export const loginUserQuery = () => {
    return `
        SELECT
            u.id,
            u.role,
            u.phone,
            u.uid,
            u.active_profile_id,
            u.created_at,
            u.color,
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
            u.color,
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



export const actionToGetCommunityAllPostDataQuery = (payload, userId) => {
    let values = [];
    let conditionList = [];

    if (payload?.only_me) {
        conditionList.push(`community_post.created_by = ?`);
        values.push(userId);
    }

    const condition = conditionList.length > 0 ? conditionList.join(' AND ') : '1'; // '1' is always true

    // Default pagination
    const limit = payload.limit ? parseInt(payload.limit) : 20;
    const offset = payload.offset ? parseInt(payload.offset) : 0;

    values.push(limit);
    values.push(offset);

    const query = `
        SELECT
            community_post.*,
            COALESCE(like_counts.count, 0) as like_counts,
            COALESCE(comment_counts.count, 0) as comment_counts,
            profile.full_name as user_name,
            app_user.color as color,
            app_user.role as role
        FROM community_post
                 INNER JOIN app_user
                            ON community_post.created_by = app_user.id
                 INNER JOIN profile
                            ON profile.id = app_user.active_profile_id
                 LEFT JOIN (
            SELECT post_id, COUNT(id) as count
            FROM community_post_comment
            GROUP BY post_id
        ) comment_counts ON community_post.id = comment_counts.post_id
                 LEFT JOIN (
            SELECT post_id, COUNT(id) as count
            FROM community_post_like
            GROUP BY post_id
        ) like_counts ON community_post.id = like_counts.post_id
        WHERE ${condition}
        ORDER BY community_post.created_at DESC
            LIMIT ? OFFSET ?;
    `;

    return { query, values };
};

export const actionToGetCommunityPostByIdQuery = () => {

    const query = `
        SELECT
            community_post.*,
            COALESCE(like_counts.count, 0) as like_counts,
            COALESCE(comment_counts.count, 0) as comment_counts,
            profile.full_name as user_name,
            app_user.color as color,
            app_user.role as role
        FROM community_post
                 INNER JOIN app_user
                            ON community_post.created_by = app_user.id
                 INNER JOIN profile
                            ON profile.id = app_user.active_profile_id
                 LEFT JOIN (
            SELECT post_id, COUNT(id) as count
            FROM community_post_comment
            GROUP BY post_id
        ) comment_counts ON community_post.id = comment_counts.post_id
                 LEFT JOIN (
            SELECT post_id, COUNT(id) as count
            FROM community_post_like
            GROUP BY post_id
        ) like_counts ON community_post.id = like_counts.post_id
        WHERE community_post.id = ?
    `;

    return { query, values };
};



export const actionToGetCommunityAllPostDataCountQuery = (payload,userId) => {
    let values = [];
    let conditionList = [];

    if (payload?.only_me) {
        conditionList.push(`community_post.created_by = ?`);
        values.push(userId);
    }

    const condition = conditionList.length > 0 ? conditionList.join(' AND ') : '1'; // '1' is always true

    const query = `
        SELECT count(id) as total_count
        FROM community_post
        WHERE ${condition}
    `;

    return { query, values };
};
