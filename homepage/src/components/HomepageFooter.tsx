'use client'

import { FOOTER_LINKS } from '@/lib/homepage-data'

export default function HomepageFooter() {
  return (
    <footer className="bg-hp-footer text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <a href="/" className="text-2xl font-bold">
              EnPeak
            </a>
            <p className="text-gray-400 text-sm mt-3 leading-relaxed">
              AI 기반 영어 학습 플랫폼.
              <br />
              대화로 배우는 진짜 영어.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">서비스</h4>
            <ul className="space-y-3">
              {FOOTER_LINKS.product.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">커뮤니티</h4>
            <ul className="space-y-3">
              {FOOTER_LINKS.community.map((link) => (
                <li key={link.label}>
                  {link.comingSoon ? (
                    <span className="text-sm text-gray-500 flex items-center gap-2">
                      {link.label}
                      <span className="text-[10px] px-1.5 py-0.5 bg-gray-700 rounded text-gray-400">Soon</span>
                    </span>
                  ) : (
                    <a href={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">지원</h4>
            <ul className="space-y-3">
              {FOOTER_LINKS.support.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <p className="text-sm text-gray-500 text-center">
            &copy; 2026 EnPeak. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
