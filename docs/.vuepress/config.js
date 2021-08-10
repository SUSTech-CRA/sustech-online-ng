let ogprefix = 'og: http://ogp.me/ns#'
let title = '南科手册'
let description = 'Online manual for sustecher'
let color = '#49BF7C'
let author = 'sustech.online'

module.exports = {
  locales: {
    '/': {
      title: '南科手册',
      lang: 'zh-CN',
      description: 'Online manual for sustecher',
    }
  },
  head: [
    ['link', { rel: 'icon', href: `/logo-assets/touch/homescreen192.png` }],
    ['meta', { name: 'theme-color', content: color }],
    ['link', { rel: 'manifest', href: '/manifest.json' }],
    ['meta', { prefix: ogprefix, property: 'og:type', content: 'article' }],
    ['meta', { prefix: ogprefix, property: 'og:image', content: 'https://cdn.jsdelivr.net/gh/sustc/sustech-online-ng@master/docs/assets/og-image.png' }],
    ['meta', { prefix: ogprefix, property: 'og:article:author', content: author }],
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }],
    ['link', { rel: 'apple-touch-icon', href: '/logo-assets/touch/homescreen168.png' }],
    ['meta', { name: 'msapplication-TileImage', content: '/logo-assets/touch/homescreen144.png' }],
    ['meta', { name: 'msapplication-TileColor', content: color }],
    ['meta', { name: 'google-site-verification', content: 'Av-srANCmFA_yZ8Iasa1yQsIPJCF_zlP5AoD35m6_Ww' }],
    ['script', {
      async: true,
      src: 'https://www.googletagmanager.com/gtag/js?id=G-1BQBXDGY3R'
    }],
    ['script', {}, `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-1BQBXDGY3R');
    `],
    ['script', { src: '/wx_helper.js' }],
    ['script', { src: 'https://res.wx.qq.com/open/js/jweixin-1.6.0.js' }],
    ['script', { src: 'https://cdn.jsdelivr.net/npm/jquery@3.5.1/dist/jquery.min.js' }],
    ['script', { src: 'https://cdn.jsdelivr.net/npm/@fancyapps/fancybox@3.5.7/dist/jquery.fancybox.min.js' }],
    ['link', { rel: 'stylesheet', type: 'text/css', href: 'https://cdn.jsdelivr.net/npm/@fancyapps/fancybox@3.5.1/dist/jquery.fancybox.min.css' }],
    ['script', { src: 'https://cdn.jsdelivr.net/npm/datatables.net@1.10.21/js/jquery.dataTables.min.js' }],
    ['link', { rel: 'stylesheet', type: 'text/css', href: 'https://cdn.jsdelivr.net/npm/datatables@1.10.18/media/css/jquery.dataTables.min.css' }]
  ],
  plugins: [
    // [
    //   '@vuepress/plugin-search',
    //   {
    //     locales: {
    //       '/': {
    //         placeholder: 'Search',
    //       },
    //       '/zh/': {
    //         placeholder: '搜索',
    //       },
    //     },
    //   },
    // ],
    [
      '@vuepress/plugin-docsearch',
      {
        apiKey: '03fed04db0cb1570c99f89739e745ed6',
        indexName: 'sustech',
        locales: {
          '/': {
            placeholder: '搜索手册',
          },
        },
      },
    ],
    [
      '@vuepress/plugin-google-analytics',
      {
        id: 'G-1BQBXDGY3R',
      },
    ],
    '@vuepress/medium-zoom',
    [
      '@vuepress/plugin-pwa',
      {
        skipWaiting: true,
      },
      {
        generateSWConfig: {
          importWorkboxFrom: 'local'
        }
      }
    ],
    [
      '@vuepress/plugin-pwa-popup',
      {
        locales: {
          '/': {
            message: '发现新内容可用',
            buttonText: '刷新',
          },
        },
      },
    ],
    '@vuepress/plugin-nprogress',
    '@vuepress/back-to-top',
    '@vuepress/plugin-git',
    '@vuepress/plugin-toc',
    // [
    //   '@vuepress/google-analytics',
    //   {
    //     'ga': 'G-1BQBXDGY3R' // UA-00000000-0
    //   },
    // ],
    //   'fulltext-search',
    //   '@vuepress/medium-zoom',
    //   '@vuepress/nprogress',
    //   '@vuepress/back-to-top',
    //   [
    //     '@vuepress/pwa',
    //     {
    //       serviceWorker: true,
    //       updatePopup: {
    //         message: "手册内容有更新！",
    //         buttonText: "刷新"
    //       },
    //       generateSWConfig: {
    //         importWorkboxFrom: 'local'
    //       }
    //     },
    //   ],
    //   [
    //     '@vuepress/last-updated',
    //     {
    //       transformer: (timestamp, lang) => {
    //         // 不要忘了安装 moment
    //         const moment = require('moment')
    //         moment.locale(lang)
    //         return moment(timestamp).format("YYYY-MM-DD HH:mm")
    //       },
    //     },
    //   ],
    //   [
    //     'sitemap',
    //     {
    //       hostname: 'https://sustech.online'
    //     },
    //   ],
  ],
  // theme: 'default-prefers-color-scheme',
  themeConfig: {
    navbar: [
      { text: '主页', link: '/' },
      { text: '关于', link: '/about/' },
      { text: '站点帮助', link: '/site-help/' },
      { text: '更新日志', link: '/news/' },
    ],
    repo: 'sustc/sustech-online-ng',
    docsRepo: 'sustc/sustech-online-ng',
    editLinkText: '一起完善这本手册！',
    docsDir: 'docs',
    repoLabel: '在Github上查看',
    editLinks: true,
    docsBranch: 'master',
    smoothScroll: true,
    sidebarDepth: 2,
    sidebar: [
      '/',
      '/facility/',
      '/contact/',
      {
        text: '📅校历',
        link: '/calendar/',
        children: [
          // SidebarItem
          {
            text: '历史校历（存档）',
            children: [
              {
                text: '2021-2022 学年',
                link: '/calendar/2021-2022.md',
                children: [],
              },
              {
                text: '2020-2021 学年',
                link: '/calendar/2020-2021.md',
                children: [],
              },
            ]
          },
        ],
      },
      // {
      //   title: '📅校历',   // 必要的
      //   path: '/calendar/',      // 可选的, 标题的跳转链接，应为绝对路径且必须存在
      //   // collapsable: false, // 可选的, 默认值是 true,
      //   sidebarDepth: 1,    // 可选的, 默认值是 1
      //   children: [
      //     ['/calendar/', '2020-2021 学年'],
      //     {
      //       title: '历史校历（存档）',
      //       children: [
      //         ['/calendar/2021-2022.md', '2021-2022 学年'],
      //         ['/calendar/2020-2021.md', '2020-2021 学年'],
      //         ['/calendar/2019-2020.md', '2019-2020 学年'],
      //         ['/calendar/2018-2019.md', '2018-2019 学年'],
      //       ]
      //     }
      //   ],
      // },
      '/service/',
      '/life/',
      '/study/',
      '/organizations/',
      '/media/',
      // {
      //   title: '🚄交通',   // 必要的
      //   path: '/transport/',      // 可选的, 标题的跳转链接，应为绝对路径且必须存在
      //   // collapsable: false, // 可选的, 默认值是 true,
      //   sidebarDepth: 1,    // 可选的, 默认值是 1
      //   children: [
      //     ['/transport/workday.md', '🚌校园巴士-工作日'],
      //     ['/transport/holiday.md', '🚌校园巴士-节假日'],
      //     ['/transport/', '周围交通'],
      //   ],
      // },
      {
        text: '🚄交通',
        link: '/transport/',
        children: [
          // SidebarItem
          {
            text: '🚌新版巴士时刻表',
            link: '/transport/bustimer.md',
            children: [],
          },
          {
            text: '🚌校园巴士-工作日',
            link: '/transport/workday.md',
            children: [],
          },
          {
            text: '🚌校园巴士-节假日',
            link: '/transport/holiday.md',
            children: [],
          },
          {
            text: '周围交通',
            link: '/transport/',
            children: [],
          },
        ],
      },
      '/surroundings/',
    ]
  }
}
