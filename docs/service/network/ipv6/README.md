# 校内 IPv6 使用与排障

::: warning 更新说明

本页原教程记录的是作者截至 **2023 年 3 月** 在校内网络和当时 OpenWrt 版本上的实测。校园网地址分配、路由器界面和 OpenWrt 防火墙实现都会变化，原文中的固定网关、接口名、启动脚本及 `ip6tables` 命令不再作为当前配置步骤。需要研究旧方案时可查看本站 Git 历史。

:::

## 先判断问题在哪一层

1. 先让电脑或手机直接连接校园无线网或墙上网口，确认设备本身能否取得 IPv6 地址并访问 IPv6 站点。
2. 再接入路由器测试。如果直连正常、路由器后方异常，优先检查路由器的 IPv6 模式、固件版本和防火墙，而不是写入固定路由。
3. 学校是否下发地址或前缀、当前支持哪些接入方式，应以网络信息中心的实时说明和答复为准；联系方式见[校园网络介绍与连接指南](../)。

可使用 [test-ipv6.com](https://test-ipv6.com/) 做基础连通性检查。IPv6 全局地址通常可被互联网路由，发布截图、日志或求助信息时请遮去完整地址、MAC 地址和设备标识。

## 普通家用路由器

先升级到厂商仍维护的固件并备份配置。路由器有“自动”“原生”“桥接”或“中继”等选项时，可先尝试自动获取；没有明确需求时，不要开启多拨、手工 NAT66、固定默认网关或来源不明的自定义防火墙规则。

不同型号对“桥接”“中继”的定义并不完全相同。若设置后下级设备无法取得 IPv6，先恢复到可用配置，再查阅该型号的当前手册或联系厂商支持。

## OpenWrt

OpenWrt 22.03 起默认从基于 `iptables` 的 firewall3 迁移到基于 `nftables` 的 firewall4；22.03 本身也已经停止维护。因此，旧教程里的 `ip6tables`、固定 `eth0.2`/`br-lan`、手写开机脚本和固定链路本地网关，不应直接复制到当前系统。

推荐按以下顺序处理：

1. 在[固件选择器](https://firmware-selector.openwrt.org/)确认设备受支持，并使用仍受维护的版本；升级前备份配置。
2. 先阅读 OpenWrt 当前的 [IPv6 配置说明](https://openwrt.org/docs/guide-user/network/ipv6/configuration)，使用 LuCI 或 UCI 的标准配置，让系统自动处理地址、路由、RA 与 DHCPv6。
3. 防火墙优先使用 `/etc/config/firewall` 或 LuCI；当前实现与迁移说明见 [Firewall overview](https://openwrt.org/docs/guide-user/firewall/overview) 和 [Netfilter management](https://openwrt.org/docs/guide-user/firewall/netfilter_iptables/netfilter_management)。
4. 仅当上游确实没有可供下游使用的前缀、桥接或中继也不适用时，再评估 NAT66。OpenWrt 的 [NAT66 指南](https://openwrt.org/docs/guide-user/network/ipv6/ipv6.nat6)明确建议：能使用正常前缀或中继时应避免 NAT66。

不要为“提速”而启用多拨，也不要为 PT 等单一应用默认打开 UPnP。UPnP 可能让应用自动创建入站映射；确需使用时，应先理解暴露范围，并在不用时关闭。

## Linux 与 systemd-networkd

原文中的 `RapidCommit=false`、`WithoutRA=solicit` 和特定 DUID 设置，是旧环境下的故障规避记录，不是适用于所有设备的默认模板。先使用发行版默认网络管理器；只有在日志证明确有 DHCPv6 或 RA 协商问题时，才根据当前 [`systemd.network` 文档](https://www.freedesktop.org/software/systemd/man/latest/systemd.network.html)逐项调整。

排障时可记录以下信息，但公开求助前应脱敏：

- 操作系统、路由器型号和固件版本；
- 直连与经路由器连接时分别能否取得 IPv6；
- 地址类型和前缀长度，不公布完整地址；
- 默认路由、DNS 与防火墙日志中的错误现象；
- 配置何时开始失效，以及是否刚升级固件或更换接入位置。

## 安全边界

- 不运行不理解的路由、防火墙或启动脚本；修改前导出配置，确保可以恢复。
- 不把路由器管理页面、SSH、文件共享或远程桌面直接暴露到公网 IPv6。
- 不在教程、工单或群聊中发布完整公网 IPv6、认证信息或设备备份文件。
- 如果配置影响宿舍其他设备、反复断网或需要绕过学校网络策略，应停止操作并联系网络信息中心。
