let ogprefix = 'og: http://ogp.me/ns#'
let title = '南科手册'
let description = 'Online manual for sustecher'
let color = '#49BF7C'
let author = 'sustech.online'

module.exports = {
  title: '南科手册',
  lang: 'zh-CN',
  description: 'Online manual for sustecher',
  head: [
    ['link', { rel: 'icon', href: `/logo-assets/touch/homescreen192.png` }],
    ['meta', { name: 'theme-color', content: color }],
    ['link', { rel: 'manifest', href: '/manifest.json' }],
    ['meta', { prefix: ogprefix, property: 'og:type', content: 'article' }],
    ['meta', { prefix: ogprefix, property: 'og:image', content: 'https://cdn.jsdelivr.net/gh/sustc/sustech-online-ng@master/docs/assests/og-image.png' }],
    ['meta', { prefix: ogprefix, property: 'og:article:author', content: author }],
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }],
    ['link', { rel: 'apple-touch-icon', href: '/logo-assets/touch/homescreen168.png' }],
    ['meta', { name: 'msapplication-TileImage', content: '/logo-assets/touch/homescreen144.png' }],
    ['meta', { name: 'msapplication-TileColor', content: color }],
    ['meta', { name: 'google-site-verification', content: 'Av-srANCmFA_yZ8Iasa1yQsIPJCF_zlP5AoD35m6_Ww' }],
    ['script', { src: 'https://cdn.jsdelivr.net/npm/jquery@3.5.1/dist/jquery.min.js' }],
    ['script', { src: 'https://cdn.jsdelivr.net/npm/@fancyapps/fancybox@3.5.7/dist/jquery.fancybox.min.js' }],
    ['link', { rel: 'stylesheet', type: 'text/css', href: 'https://cdn.jsdelivr.net/npm/@fancyapps/fancybox@3.5.1/dist/jquery.fancybox.min.css' }],
    ['script', { src: 'https://cdn.jsdelivr.net/npm/datatables.net@1.10.21/js/jquery.dataTables.min.js' }],
    ['link', { rel: 'stylesheet', type: 'text/css', href: 'https://cdn.jsdelivr.net/npm/datatables@1.10.18/media/css/jquery.dataTables.min.css' }]
  ],
  plugins: [
    [
      '@vuepress/google-analytics',
      {
        'ga': 'UA-169618277-1' // UA-00000000-0
      },
    ],
    'fulltext-search',
    [
      '@vuepress/pwa',
      {
        serviceWorker: true,
        updatePopup: {
          message: "发现新内容可用",
          buttonText: "刷新"
        },
      },
    ],
    [
      '@vuepress/last-updated',
      {
        transformer: (timestamp, lang) => {
          // 不要忘了安装 moment
          const moment = require('moment')
          moment.locale(lang)
          return moment(timestamp).format("YYYY-MM-DD HH:mm")
        },
      },
    ],
    [
      'sitemap',
      {
        hostname: 'https://sustech.online'
      },
    ],
  ],
  themeConfig: {
    nav: [
      { text: '主页', link: '/' },
      { text: '关于', link: '/about/' },
      { text: '站点帮助', link: '/site-help/' },
    ],
    repo: 'sustc/sustech-online-ng',
    docsRepo: 'sustc/sustech-online-ng',
    editLinkText: '一起完善这本手册！',
    docsDir: 'docs',
    repoLabel: '在Github上查看',
    editLinks: true,
    smoothScroll: true,
    sidebarDepth: 2,
    sidebar: [
      '/',
      '/facility/',
      '/contact/',
      {
        title: '📅校历',   // 必要的
        // path: '/calendar/',      // 可选的, 标题的跳转链接，应为绝对路径且必须存在
        // collapsable: false, // 可选的, 默认值是 true,
        sidebarDepth: 1,    // 可选的, 默认值是 1
        children: [
          ['/calendar/', '2019-2020 学年'],
          {
            title: '历史校历（存档）',
            children: [
              ['/calendar/2020-2021.md', '2020-2021 学年（预发布）'],
              ['/calendar/2019-2020.md', '2019-2020 学年'],
              ['/calendar/2018-2019.md', '2018-2019 学年'],
            ]
          }
        ],
      },
      '/service/',
      '/study/',
      '/network/',
      '/media/',
      '/catering/',
      {
        title: '🚄交通',   // 必要的
        // path: '/calendar/',      // 可选的, 标题的跳转链接，应为绝对路径且必须存在
        // collapsable: false, // 可选的, 默认值是 true,
        sidebarDepth: 1,    // 可选的, 默认值是 1
        children: [
          ['/transport/workday.md', '🚌校园巴士-工作日'],
          ['/transport/holiday.md', '🚌校园巴士-节假日'],
          ['/transport/', '周围交通'],
        ],
      },
      '/surroundings/',
    ]
  }
}
