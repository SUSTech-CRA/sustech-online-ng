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
    ['link', { rel: 'icon', href: `/assets/favicon.ico` }],
    ['meta', { name: 'theme-color', content: color }],
    ['meta', { prefix: ogprefix, property: 'og:type', content: 'article' }],
    ['meta', { prefix: ogprefix, property: 'og:image', content: 'https://cdn.jsdelivr.net/gh/sustc/sustech-online-ng@master/docs/assests/og-image.png' }],
    ['meta', { prefix: ogprefix, property: 'og:article:author', content: author }],
    ['meta', { name: 'google-site-verification', content: 'Av-srANCmFA_yZ8Iasa1yQsIPJCF_zlP5AoD35m6_Ww' }],
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
      '@vuepress/last-updated',
      {
        transformer: (timestamp, lang) => {
          // 不要忘了安装 moment
          const moment = require('moment')
          moment.locale(lang)
          return moment(timestamp).fromNow()
        },
      },
    ],
  ],
  themeConfig: {
    nav: [
      { text: '主页', link: '/' },
      { text: '关于', link: '/about/' },
    ],
    repo: 'sustc/sustech-online-ng',
    docsRepo: 'sustc/sustech-online-ng',
    editLinkText: '一起完善这本手册！',
    docsDir: 'docs',
    repoLabel: '在Github上查看',
    editLinks: true,
    sidebarDepth: 2,
    sidebar: {
      '/': [
        '',     /* /foo/ */
        '/facility/',
        '/contact/',
        '/calendar/',
        '/service/',
        '/study/',
        '/network/',
        '/media/',
        '/catering/',
        '/transport/',
        '/surroundings/',
      ],
    }
  }
}
