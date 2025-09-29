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
                'selected_live_class_id', p.selected_live_class_id,
                'first_pregnancy', p.first_pregnancy,
                'last_period_date', p.last_period_date,
                'cycle_length', p.cycle_length,
                'period_length', p.period_length,
                'created_at', p.created_at
            ) AS profile,
            (SELECT JSON_OBJECT(
                               'id', s.id,
                               'plan_id', s.plan_id,
                               'plan_type', sp.plan_type,
                               'plan_name', sp.plan_name,
                               'total_amount', s.total_amount,
                               'payment_status', s.payment_status,
                               'start_date', s.start_date,
                               'end_date', s.end_date,
                               'features', CAST(sp.features AS JSON)
                       )
                FROM user_subscriptions s
                JOIN subscription_plans sp ON sp.id = s.plan_id
                WHERE s.user_id = u.id
                  AND s.payment_status = 'success'
                  AND s.end_date >= CURDATE()
                  AND s.is_active = 1
                ORDER BY s.end_date DESC
                LIMIT 1
            ) AS active_subscription
        FROM app_user u
        LEFT JOIN profile p ON p.id = u.active_profile_id
        WHERE u.phone = ? AND u.otp = ?
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
                    'selected_live_class_id', p.selected_live_class_id,
                    'first_pregnancy', p.first_pregnancy,
                    'last_period_date', p.last_period_date,
                    'cycle_length', p.cycle_length,
                    'period_length', p.period_length,
                    'created_at', p.created_at
            ) AS profile,
            (
                SELECT JSON_OBJECT(
                               'id', s.id,
                               'plan_id', s.plan_id,
                               'plan_type', sp.plan_type,
                               'plan_name', sp.plan_name,
                               'total_amount', s.total_amount,
                               'payment_status', s.payment_status,
                               'start_date', s.start_date,
                               'end_date', s.end_date,
                               'features', CAST(sp.features AS JSON)
                       )
                FROM user_subscriptions s
                         JOIN subscription_plans sp ON sp.id = s.plan_id
                WHERE s.user_id = u.id
                  AND s.payment_status = 'success'
                  AND s.end_date >= CURDATE()
                  AND s.is_active = 1
                ORDER BY s.end_date DESC
                 LIMIT 1
            ) AS active_subscription
        FROM app_user u
            LEFT JOIN profile p ON p.id = u.active_profile_id
        WHERE u.id = ?
    `;

};

export const actionToGetCommunityAllPostDataQuery = (payload, userId) => {
    // WHERE clause (parameterized)
    const whereParts = [];
    if (payload?.only_me) {
        whereParts.push(`community_post.created_by = ?`);
    }
    const whereSql = whereParts.length ? whereParts.join(" AND ") : "1";

    // Pagination (defaults + clamp)
    const limit =
        Number.isFinite(+payload?.limit) && +payload.limit > 0
            ? Math.min(100, Math.floor(+payload.limit))
            : 20;
    const offset =
        Number.isFinite(+payload?.offset) && +payload.offset >= 0
            ? Math.floor(+payload.offset)
            : 0;

    const values = [userId];
    if (payload?.only_me) values.push(userId);
    values.push(limit, offset);

    const query = `
    SELECT
      community_post.*,
      (SELECT COUNT(*) FROM community_post_like    WHERE post_id = community_post.id)  AS like_counts,
      (SELECT COUNT(*) FROM community_post_comment WHERE post_id = community_post.id)  AS comment_counts,
      EXISTS(
        SELECT 1 FROM community_post_like
        WHERE post_id = community_post.id AND user_id = ?
      ) AS liked_by_you,
      profile.full_name AS user_name,
      app_user.color    AS color,
      app_user.role     AS role
    FROM community_post
      JOIN app_user ON community_post.created_by = app_user.id
      JOIN profile  ON profile.id = app_user.active_profile_id
    WHERE ${whereSql}
    ORDER BY community_post.created_at DESC
    LIMIT ? OFFSET ?;
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



export const actionToGetCommunityPostByIdQuery = () => `
    SELECT
        community_post.*,
        (SELECT COUNT(*) FROM community_post_like    WHERE post_id = community_post.id)  AS like_counts,
        (SELECT COUNT(*) FROM community_post_comment WHERE post_id = community_post.id)  AS comment_counts,
        EXISTS(
            SELECT 1 FROM community_post_like
            WHERE post_id = community_post.id AND user_id = ?
        ) AS liked_by_you,
        profile.full_name AS user_name,
        app_user.color    AS color,
        app_user.role     AS role
    FROM community_post
             JOIN app_user ON community_post.created_by = app_user.id
             JOIN profile  ON profile.id = app_user.active_profile_id
    WHERE community_post.id = ?
`;


export const actionToGetCommunityPostCommentDataByIdQuery = () => `
    SELECT
        community_post_comment.*,
        profile.full_name AS user_name,
        app_user.color    AS color,
        app_user.role     AS role
    FROM community_post_comment
             JOIN community_post ON community_post.id = community_post_comment.post_id
             JOIN app_user ON community_post_comment.user_id = app_user.id
             JOIN profile  ON profile.id = app_user.active_profile_id
    WHERE community_post.id = ?
`;


export const actionToGetAppVideoLibraryDataByCategoryQuery = (category, role, trimester) => {
    let values = [];
    let conditionList = [];

    // ✅ Category filter
    if (category) {
        conditionList.push(`category = ?`);
        values.push(category);
    }

    // ✅ Role filter
    if (role) {
        conditionList.push(`role = ?`);
        values.push(role);
    }

    // ✅ Trimester filter
    if (trimester && role === 2) {
        conditionList.push(`(trimester IS NULL OR trimester = ?)`);
        // null = applicable for all, or match exact trimester
        values.push(trimester);
    }

    const condition = conditionList.length > 0 ? conditionList.join(' AND ') : '1'; // always true fallback

    const query = `
        SELECT
            id,
            title,
            description,
            thumbnail,
            category,
            role,
            trimester
        FROM video_library
        WHERE ${condition}
    `;

    return { query, values };
};
// Returns { query, values } to use with your DB driver
export const actionToGetDailyTasksByUserIdQuery = (role) => {
    // Task list by role
    const tasksPregnant = ["YOGA","MEDITATION","SAMVAAD","MANTRA","HYDRATION","MOOD"]; // role = 2
    const tasksTTC      = ["YOGA","MEDITATION","AFFIRMATION","MANTRA","HYDRATION","MOOD"]; // role != 2

    const tasks = role === 2 ? tasksPregnant : tasksTTC;

    const tasksCte = `
    WITH tasks AS (
      SELECT '${tasks[0]}' task UNION ALL
      SELECT '${tasks[1]}' UNION ALL
      SELECT '${tasks[2]}' UNION ALL
      SELECT '${tasks[3]}' UNION ALL
      SELECT '${tasks[4]}' UNION ALL
      SELECT '${tasks[5]}'
    )
  `;

    return  `
    ${tasksCte}
    SELECT
      t.task,
      COALESCE(dtp.progress_percent, 0) AS progress_percent,
      dtp.details,
      dtp.created_at,
      dtp.updated_at,
      dtp.id
    FROM tasks t
    LEFT JOIN daily_task_progress dtp
      ON dtp.user_id = ?
     AND dtp.task_date = CURDATE()
     AND dtp.task = t.task
    ORDER BY FIELD(t.task, ${tasks.map(t => `'${t}'`).join(", ")});
  `;

};


