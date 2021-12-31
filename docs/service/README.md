# 🖥服务与技巧
## SID (Student ID) 相关

### 🆔学号

- [学号的含义](./sid)

### 💳校园卡&学生证

- [校园卡](./campus-card)
- [火车票学生优惠使用指南](./student-train-ticket/)

## 信息服务

### 🌐校园网络

- [校园网络介绍与连接指南](./network)
  - *（包括无线网络，有线网络与电信自费宽带）*
- [eduroam（学术网路漫游）](./network/eduroam)
- [校内 IPv6 设置教程](./network/ipv6)
- [回校VPN申请](./network/apply-for-vpn)
- [信息中心相关信息](./network/#信息中心)

### Ehall

1. [SUSTech ehall | 成绩查询](http://ehall.sustech.edu.cn/publicapp/sys/cjcxapp/index.do)
2. [SUSTech ehall | 失物招领](http://ehall.sustech.edu.cn/publicapp/sys/pubswzlapp/index.do)

### 计算机研究协会（CRA）

部分项目与科学计算中心合作部署。

1. [💿SUSTech/CCSE/CRA/LUG镜像站](https://mirrors.sustech.edu.cn/)：包含常用镜像与软件源 **（已开放公网访问）**。
2. [💾Git 服务](https://mirrors.sustech.edu.cn/git/)：使用GitLab部署的代码托管服务。可用CAS登陆 **（已开放公网访问）**。
3. [🌍校园网测速](https://speedtest.cra.moe/)：内网测速。
4. [📄Markdown](https://md.cra.moe/)：在线 Markdown 服务，可用CAS登陆 **（已开放公网访问）**。
5. [📄ShareLaTex](https://sharelatex.cra.moe/project)：在线LaTex服务，Overleaf服务，想体验的同学请发一封标题为 `sharelatex申请` 的邮件（正文可不填）到 `service@cra.moe`，看到邮件之后会手动给大家发送邀请。（请尽量使用学校的邮箱）（如果在您在校外，可以通过[https://sharelatex.sustcra.com/](https://sharelatex.sustcra.com/)访问）。
6. [📁Send 文件分享](https://send.cra.moe/)：上传最大10G的文件，并使用链接将文件分享给在校园网下的其他的同学。文件默认于服务上存储10天，最多可保存30天。文件被加密存储于科学计算中心的服务器上，仅链接拥有者可以访问。（后台无法看到文件的内容）您同时也可以在上传文件后主动删除文件或者设置成在一次下载后自动删除文件。
7. [🛠 软件资源下载](https://dl.cra.moe/)
8. [🖥️服务状态监控](https://monitor.cra.moe)：校园网络，CRA服务监控。
9.  🌊[反馈社区](https://c.cra.moe)：反馈与交流相关服务。可使用CAS登陆。
10. DNS123服务：`10.20.110.123`，可通过此服务访问[Google Scholar](https://scholar.google.com.hk/)等学术服务。




## 教学相关

### 👨‍🏫Sakai

- [Sakai | 文件分享](./sakai)

### 🖨联创打印系统

- [联创打印系统使用指南](./unifound)

### 👨‍🏫BlackBoard

- [Blackboard｜将Blackboard中作业，DDL等日程添加到系统日历](./blackboard/retrive-ics-url/)

## 通讯相关

### 📧电子邮件服务

- [电子邮件服务](./email)

### 💬企业微信

- [企业微信](./work-wechat)

## 📦邮件与快递收发

- [📦邮件与快递收发](./mail-and-express)

## 🏥医疗服务/就诊

::: warning 默认转诊医院变更
学校的社区健康服务中心门诊转诊定点医疗机构已在2021年7月改为**南方科技大学医院（西丽人民医院）**。本文中的部分内容可能已经过时。
:::

- [我应该怎样优雅就诊/南科新知](./ssc)
- [就医指南/树德书院《南科行前记》](./medical-treatment)

## 软件授权

### 学校已购买的软件与服务

1. [Matlab](./matlab/)
2. WPS政府版：请在[此处（内网）](http://172.18.7.160/)下载

### 教育邮箱福利

1. [Office 365](https://signup.microsoft.com/signup?sku=Education)
   * 仅有 Office online 套件，OneDrive 1TB 等
   * 不含 桌面版 Office 365 许可
2. [Jetbrains 全家桶](https://www.jetbrains.com/zh/student/)
   - 包含JetBarins旗下软件的教育授权
3. [Github Student Pack](https://education.github.com/pack)
   - 包含一年免费.me域名，Digital Ocean一年100美金代金券等服务。
4. [AutoDesk软件](https://www.autodesk.com.cn/education/free-software/featured)
   - 软件授权为教育版

### 非官方Windows套件激活服务<Badge text="仅限学习与评估用途" type="warning"/>

::: details

**Windows:**

1. 在[此处](https://docs.microsoft.com/zh-cn/windows-server/get-started/kmsclientkeys#windows-10-all-supported-semi-annual-channel-versions)查找希望激活的Windows版本，记下相应的KMS客户端安装程序密钥。
2. 以管理员身份启动cmd，设置kms服务器`slmgr /skms dns.cra.moe`，设置密钥`slmgr /ipk [KMS客户端安装程序密钥]`
3. 激活：`slmgr /ato`

**Office:**

1. [下载Office Tool Plus](https://otp.landian.vip/zh-cn/)
2. 参考 [https://www.coolhub.top/archives/14](https://www.coolhub.top/archives/14) 中的 `使用 Office Tool Plus 手动激活` 一节，将KMS服务器设置为`dns.cra.moe`。

上述服务仅在学校内网有效。

:::

## 图书馆服务

除了常规的自习室与纸质书刊借阅服务外，图书馆还提供其他服务：
### 讨论间
可供小组讨论的隔音空间，一般需要提前预约，[预约系统地址（点此）](https://booking.lib.sustech.edu.cn/)。

如果有尚未被预约的讨论间，也可以直接使用。

### 电子数据库
截至2020年10月，图书馆共购买了152个数据库。下面列出常用的几个数据库，详细列表请查看图书馆网站上的[《数据库导航》](https://lib.sustech.edu.cn/sjk/list.htm)，如需校外访问，请[从此进入]([https://lib.sustech.edu.cn/xwfw_154/list.htm])。

1. [CNKI中国知网数据库（校内免费下载）](https://www.cnki.net)
2. [CNKI中国知网数据库（校外访问入口）](https://fsso.cnki.net/Shibboleth.sso/Login?entityID=https://idp.sustech.edu.cn/idp/shibboleth&target=https://fsso.cnki.net/secure/default.aspx&locale=zh_CN)
3. [百度文库高校版（校内免费下载）](https://eduai.baidu.com/)
4. [Wind资讯金融数据库（图书馆三楼/慧园三栋313办公室）](https://lib.sustech.edu.cn/2021/0226/c297a2544/page.htm)
5. [新东方多媒体学习库数据库（校内外都可直接使用）](https://lib.sustech.edu.cn/2021/0226/c297a2541/page.htm)

### 图书馆荐购
可以通过以下任意方式荐购图书：
* 至图书馆服务台领取荐购单填写信息后交给服务台。
* 在图书馆[官网荐购页面](https://lib.sustech.edu.cn/dzjg/list.htm)填写荐购信息。
* 发送荐购信息至邮箱[lib_acq@sustech.edu.cn](mailto:lib_acq@sustech.edu.cn)荐购。


## 什么值得买

### 生活好物

### 电子设备

- [路由器](./network/choose-a-router)

### 平板电脑

如需购买苹果产品，请参考[macrumors buyers guide](https://buyersguide.macrumors.com/)。

## 校园标识 / 文档模版

- 南科大品牌文化服务网（标识，VI，信纸，ppt模版下载）[http://files.sustech.edu.cn/](http://files.sustech.edu.cn/)（需CAS认证）
- [SUSTech LaTex 模板目录](https://github.com/SUSTC/latex-template)
