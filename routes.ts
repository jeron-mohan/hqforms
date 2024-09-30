
export const publicRoutes = [
    "/"
]


export const authRoutes = [
    "/auth/login",
    "/auth/register"
]


export const apiAuthPrefix = "/api/auth"



export const DEFAULT_LOGIN_REDIRECT = "/homepage"

export const isPublicFormRoute = (path: string) => {
    const formRegex = /^\/forms\/[^/]+$/;
    return formRegex.test(path);
}

// Function to check if a route is public
export const isPublicRouteUpdated = (path: string) => {
    return publicRoutes.includes(path) || isPublicFormRoute(path);
}