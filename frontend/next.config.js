/** @type {import('next').NextConfig} */
const nextConfig = {
  // 정적 빌드 (FastAPI에서 서빙)
  output: 'export',

  // 이미지 최적화 비활성화
  images: {
    unoptimized: true,
  },

  basePath: '',
  assetPrefix: '',
  reactStrictMode: true,
}

module.exports = nextConfig
