export const getPaginationMeta = (
    totalItems: number,
    page: number,
    limit: number
) => {

    const totalPages = Math.ceil(totalItems / limit);

    return {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
    };
};