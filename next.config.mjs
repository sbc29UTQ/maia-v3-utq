/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    optimizePackageImports: ['recharts', 'chart.js', 'react-chartjs-2', 'apexcharts', 'd3'],
  },
  serverExternalPackages: ['canvas'],
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'd3': 'd3/dist/d3.min.js',
    }
    
    if (isServer) {
      config.externals.push('canvas')
    }
    
    return config
  },
  env: {
    CHART_CACHE_TTL: '3600',
    ENABLE_CHART_WORKERS: 'true',
  }
}

export default nextConfig
