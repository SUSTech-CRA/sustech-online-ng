import { defaultTheme } from '@vuepress/theme-default'
import { docsearchPlugin } from '@vuepress/plugin-docsearch'
// import { googleAnalyticsPlugin } from '@vuepress/plugin-google-analytics'
import { pwaPlugin } from '@vuepress/plugin-pwa'
// import { pwaPopupPlugin } from '@vuepress/plugin-pwa-popup'
import { tocPlugin } from '@vuepress/plugin-toc'
import { sitemapPlugin } from "vuepress-plugin-sitemap2"
import { defineUserConfig } from '@vuepress/cli'
import { viteBundler } from '@vuepress/bundler-vite'

const ogprefix = 'og: http://ogp.me/ns#'
const title = '你科手册'
const description = 'Online manual for sustecher'
const color = '#49BF7C'
const author = 'sustech.online'

export default defineUserConfig({
    bundler: viteBundler({
        viteOptions: {
            ssr: {
                noExternal: ['echarts', 'vue-echarts', 'resize-detector', 'zrender'],
            },
        },
    }),
    locales: {
        '/': {
            title: title,
            lang: 'zh-CN',
            description: description,
        }
    },
    head: [
        ['link', { rel: 'icon', href: `/logo-assets/touch/homescreen192.png` }],
        ['meta', { name: 'theme-color', content: color }],
        ['link', { rel: 'manifest', href: '/manifest.webmanifest' }],
        ['meta', { prefix: ogprefix, property: 'og:type', content: 'article' }],
        ['meta', {
            prefix: ogprefix,
            property: 'og:image',
            content: 'https://mirrors.sustech.edu.cn/git/sustech-online/sustech-online-ng/-/raw/master/docs/assets/og-image.png'
        }],
        ['meta', { prefix: ogprefix, property: 'og:article:author', content: author }],
        ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
        ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }],
        ['link', { rel: 'apple-touch-icon', href: '/logo-assets/touch/homescreen168.png' }],
        ['meta', { name: 'msapplication-TileImage', content: '/logo-assets/touch/homescreen144.png' }],
        ['meta', { name: 'msapplication-TileColor', content: color }],
        ['meta', { name: 'google-site-verification', content: 'Av-srANCmFA_yZ8Iasa1yQsIPJCF_zlP5AoD35m6_Ww' }],
        ['script', {
            async: true,
            src: 'https://googletagmanager.com/gtag/js?id=G-1BQBXDGY3R'
        }],
        ['script', {}, `
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', 'G-1BQBXDGY3R');
                        `],
        ['script', { src: '/wx_helper.js' }],
        ['script', { src: 'https://res.wx.qq.com/open/js/jweixin-1.6.0.js' }],
        ['script', { src: 'https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/jquery/3.6.0/jquery.min.js' }],
        ['script', { src: 'https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/fancybox/3.5.7/jquery.fancybox.min.js' }],
        ['link', {
            rel: 'stylesheet',
            type: 'text/css',
            href: 'https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/fancybox/3.5.7/jquery.fancybox.min.css'
        }],
        ['script', { src: 'https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/datatables/1.10.21/js/jquery.dataTables.min.js' }],
        ['link', {
            rel: 'stylesheet',
            type: 'text/css',
            href: 'https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/datatables/1.10.21/css/jquery.dataTables.min.css'
        }]
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
        // [
        //     '@vuepress/plugin-docsearch',
        //     {
        //         apiKey: '03fed04db0cb1570c99f89739e745ed6',
        //         indexName: 'sustech',
        //         locales: {
        //             '/': {
        //                 placeholder: '搜索手册',
        //             },
        //         },
        //     },
        // ],
        docsearchPlugin({
            appId: '6KECEJUGJH',
            apiKey: '9a5c8aa7cb2d5d32ebd66790e1a84789',
            indexName: 'sustech-online-keys',
            locales: {
                '/': {
                    placeholder: '搜索手册',
                    translations: {
                        button: {
                            buttonText: '搜索手册',
                            buttonAriaLabel: '搜索手册',
                        },
                        modal: {
                            searchBox: {
                                resetButtonTitle: '清除查询条件',
                                resetButtonAriaLabel: '清除查询条件',
                                cancelButtonText: '取消',
                                cancelButtonAriaLabel: '取消',
                            },
                            startScreen: {
                                recentSearchesTitle: '搜索历史',
                                noRecentSearchesText: '没有搜索历史',
                                saveRecentSearchButtonTitle: '保存至搜索历史',
                                removeRecentSearchButtonTitle: '从搜索历史中移除',
                                favoriteSearchesTitle: '收藏',
                                removeFavoriteSearchButtonTitle: '从收藏中移除',
                            },
                            errorScreen: {
                                titleText: '无法获取结果',
                                helpText: '你可能需要检查你的网络连接',
                            },
                            footer: {
                                selectText: '选择',
                                navigateText: '切换',
                                closeText: '关闭',
                                searchByText: '搜索提供者',
                            },
                            noResultsScreen: {
                                noResultsText: '无法找到相关结果',
                                suggestedQueryText: '你可以尝试查询',
                                reportMissingResultsText: '你认为该查询应该有结果？',
                                reportMissingResultsLinkText: '点击反馈',
                            },
                        },
                    },
                },
            },
        }),
        // googleAnalyticsPlugin({
        //     // we have multiple deployments, which would use different id
        //     id: 'G-1BQBXDGY3R',
        // }),
        pwaPlugin({
            maximumFileSizeToCacheInBytes: 524288, // 限制到0.5MB
            // globIgnores: ['**/*.{png,svg,jpg,jpeg,gif,pdf}'], // 图片不再缓存
            runtimeCaching: [{
                urlPattern: ({ url }) => url.origin === 'https://sustech.online',
                handler: 'NetworkFirst',
                options: {
                    cacheName: 'web-cache',
                    networkTimeoutSeconds: 5,
                    expiration: {
                        maxEntries: 50,
                        maxAgeSeconds: 1 * 24 * 60 * 60, // 1 day
                    },
                    cacheableResponse: {
                        statuses: [0, 200],
                    },

                }
            }, {
                urlPattern: ({ request }) => request.destination === 'image',
                handler: 'StaleWhileRevalidate',
                options: {
                    cacheName: 'images-cache',
                    expiration: {
                        maxAgeSeconds: 1 * 24 * 60 * 60, // 1 day
                    },
                    cacheableResponse: {
                        statuses: [0, 200],
                    }
                },
            }],
            skipWaiting: true, // 如果使用 pwaPopupPlugin 不能设置为 true
            clientsClaim: true, // 立即接管
            offlineGoogleAnalytics: true, // 离线也记录ga数据, 有网了再上报的意思。
            cleanupOutdatedCaches: true,  // 尝试删除老版本缓存
        }),
        // pwaPopupPlugin({
        //     locales: {
        //         '/': {
        //             message: '发现新内容可用',
        //             buttonText: '刷新',
        //         },
        //     },
        // }),
        sitemapPlugin({
            hostname: "https://sustech.online/",
        }),
        tocPlugin(),
    ],
    theme: defaultTheme({
        navbar: [
            { text: '主页', link: '/' },
            { text: '快讯网', link: 'https://daily.sustech.online/' },
            { text: '小程序', link: '/miniapp/' },
            { text: '关于', link: '/about/' },
            { text: '站点帮助', link: '/site-help/' },
        ],
        repo: 'sustech-cra/sustech-online-ng',
        repoLabel: '在Github上查看',
        docsRepo: 'sustech-cra/sustech-online-ng',
        docsDir: 'docs',
        editLinkText: '一起完善这本手册！',
        lastUpdatedText: '上次更新',
        contributorsText: '贡献者',
        editLink: true,
        docsBranch: 'master',
        // 本地化
        // custom containers
        tip: '提示',
        warning: '注意',
        danger: '警告',
        // 404 page
        notFound: [
            '这里什么都没有',
            '我们怎么到这来了？',
            '这是一个 404 页面',
            '看起来我们进入了错误的链接',
        ],
        backToHome: '返回首页',
        // a11y
        openInNewWindow: '在新窗口打开',
        toggleColorMode: '切换夜间模式',
        toggleSidebar: '切换侧边栏',
        sidebarDepth: 2,
        sidebar: [
            '/',
            '/facility/',
            '/contact/',
            '/calendar/',
            '/service/',
            '/life/',
            '/study/',
            '/organizations/',
            '/media/',
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
    }),
})
