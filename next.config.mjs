/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "images.unsplash.com",
            },
            {
                protocol: "https",
                hostname: "i.ibb.co",
            },
            {
                protocol: "https",
                hostname: "utfs.io",
            }, 
            {
                protocol: "https",
                hostname: "replicate.delivery",
            },

        ],
    },
};



export default nextConfig;
