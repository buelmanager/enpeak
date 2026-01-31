/** @type {import('next').NextConfig} */
const buildTime = Date.now()

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

  // 빌드 ID를 타임스탬프로 설정
  generateBuildId: async () => {
    return `build-${buildTime}`
  },

  // 빌드 타임스탬프를 환경변수로 전달 (청크 해시 변경용)
  env: {
    BUILD_TIMESTAMP: buildTime.toString(),
  },
}

module.exports = nextConfig
