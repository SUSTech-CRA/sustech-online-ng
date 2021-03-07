# 校内远程桌面使用指北

by [@jerrylususu](https://github.com/jerrylususu)

::: tip

本文写于2020年12月。

:::

## 远程桌面是什么？

远程桌面，是一种远程访问技术，可以从其他设备连接到你的电脑，并访问所有应用、文件和资源，就像坐在自己的电脑前一样。简而言之，这是一项可以把不属于自己的设备当成自己的设备使用的技术。

作为一项技术，远程桌面有不同的实现。在 Windows 环境下，最常见的远程桌面实现为 Remote Desktop Protocol （RDP，远程桌面协议），Windows 为其提供了完善的支持。在 Linux 环境下，最常见的远程桌面实现为 Virtual Network Computing （VNC）。其他厂家也有自己的远程桌面实现，如 TeamViewer, AnyDesk, ToDesk, 向日葵, 甚至于 QQ 的「远程协助」。本文将着眼于 Windows 环境下 RDP 的配置，这也是校内最常见的用例。

## 远程桌面的典型使用场景

* 购买了重量较重的游戏本或不便于携带的台式机在宿舍，但是想从图书馆、实验室等位置使用。
* 在参加计算机系的实验课程时，使用宿舍或实验室内性能强大的设备进行编译操作，而不必被机房性能羸弱的电脑限制。
* 在图书馆专心复习时，仍能访问宿舍电脑上存储的课件、笔记、电子书等资料。
* 在教室 Pre 的时候发现自己忘了携带所需的资料，可以使用远程桌面从宿舍电脑上取回。
* 在校内有 WiFi 信号覆盖的位置使用远程桌面连接回宿舍电脑继续工作/学习，而无需手动维持不同设备（如笔记本和台式机）间的数据同步状态。
* 在宿舍床上使用 iPad 等平板类设备游玩床下电脑中的 Galgame。

## 不建议使用远程桌面的场景

* 玩大型游戏、看电影/视频（RDP 主要为日常工作使用优化，变化频繁的画面使用 Steam Remote Play 等技术更适合）
* 复制体积较大的文件（RDP 对在不同设备间转移小文件十分合适，但文件体积过大可能造成网络阻塞，操作卡死）

> 下称自己的设备为「服务端」，机房/教室/图书馆等的设备为「客户端」

## 服务端配置

1. [开启「远程桌面」功能。](https://support.microsoft.com/zh-cn/windows/%E5%A6%82%E4%BD%95%E4%BD%BF%E7%94%A8%E8%BF%9C%E7%A8%8B%E6%A1%8C%E9%9D%A2-5fe128d5-8fb1-7a23-3b8a-41e636865e8c)（此功能需要专业版本 Windows，家庭版本可以使用 GitHub 上的开源工具 [RDPWrap](https://github.com/stascorp/rdpwrap) 开启此功能，[教程](https://www.iplaysoft.com/rdp-wrapper-library.html))。
2. [设置远程桌面端口为非 3389 端口](https://docs.microsoft.com/zh-cn/windows-server/remote/remote-desktop-services/clients/change-listening-port) ，并记住这个端口号（此为信息中心的限制，为防止病毒通过远程桌面传播，默认阻断了 3389 端口上的 TCP 链接）
3. 查看并记录自己的 IP 地址：打开「任务管理器」，切换到「性能」标签页，在左侧找到「Wi-Fi」，在右侧找到「IPv4 地址」并记录。（通常为以小数点分割的一组数字，如 `10.XX.XX.XX`）

## 从客户端连接

1. 在「开始」菜单中选择「Windows 附件 / 远程桌面」（或使用 `Win+R` 打开「运行」窗口，然后输入 `mstsc`，按下回车）
2. 在「计算机」文本框中输入自己的 IP 和端口号，用英文冒号分割。（例：`10.XX.XX.XX:YYYY`）
3. 点击「连接」按钮
4. 在弹出的认证窗口中输入自己的用户名和密码（如果服务端使用的是微软账户，需要输入微软账户的邮箱和密码）
5. 在证书确认窗口点击「是」
6. 如果一切正常，应该能见到远程设备的桌面了。

### 用于在校内网通过邮箱获取服务端IP地址的``python``脚本:
by [@KagaJiankui](https://github.com/KagaJiankui)

::: details 获取IP的脚本

```python
# coding: utf-8

import smtplib
import time
import datetime
from email.mime.text import MIMEText
from email.header import Header
import socket

_local_ip = None

mail_info = {
    'recv_address': 'recv@example.sustech.com', #你的接收端邮箱地址
    'sender_name': 'send@example.sustech.com', #你的发送端邮箱地址
    'sender_pwd': 'authenticationcode', #授权码（用于qq或163邮箱）
    'smtp_server': 'smtp.example.com', #smtp发送服务器（在邮箱帮助页面查看）
    'subject': '远程电脑IP信息已更新',
    'content': '您的校内网IP信息: {}'
}


def send_message(content):
    # 设置发送邮件的内容
    msg = MIMEText(content, 'plain', 'utf-8')
    msg['From'] = Header(mail_info.get('sender_name'))
    msg['Subject'] = Header(mail_info.get('subject'), 'utf-8')
    msg['To'] = Header(mail_info.get('recv_address'))
    # 发送邮件
    smtp = smtplib.SMTP()
    smtp.connect(mail_info['smtp_server'])
    smtp.login(mail_info['sender_name'], mail_info['sender_pwd'])
    smtp.sendmail(mail_info['sender_name'], mail_info['recv_address'],msg.as_string())
    try:
        smtp.quit()
    except smtplib.SMTPException as e:
        e = "Failed to close SMTP session."


def get_host_ip():
    """
    这个方法是目前见过最优雅获取本机服务器的IP方法了。没有任何的依赖，也没有去猜测机器上的网络设备信息。
    而且是利用 UDP 协议来实现的，生成一个UDP包，把自己的 IP 放如到 UDP 协议头中，然后从UDP包中获取本机的IP。
    这个方法并不会真实的向外部发包，所以用抓包工具是看不到的。但是会申请一个 UDP 的端口，所以如果经常调用也会比较耗时的，这里如果需要可以将查询到的IP给缓存起来，性能可以获得很大提升。
    :return:
    """
    global _local_ip
    s = None
    try:
        if not _local_ip:
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.connect(('8.8.8.8', 80))
            _local_ip = s.getsockname()[0]
        return _local_ip
    finally:
        if s:
            s.close()


def mail_ip_send(ip_real):
    """
    使用邮件发送IP地址.
    """
    info_dict = "校内网IP: " + ip_real + "\n" + datetime.datetime.now().strftime(
        "%Y-%m-%d %H:%M:%S %Z") + "\n"
    print(info_dict)
    send_message(info_dict)


ip_val = get_host_ip()
num = 0
seconds_sleep = 5  # 检测IP地址的时间间隔
itr = 4 * 3600 / seconds_sleep  # IP地址无变动时默认发送邮件的小时数
while 1:
    ip_real = get_host_ip()
    h = datetime.datetime.now().hour
    if (ip_real != ip_val) & ((h <= 3) | (h >= 7)) | num == 0:  #晚上3点到早7点之间不发送IP
        mail_ip_send(ip_real)
        ip_val = ip_real
    num += 1
    if num >= itr:
        mail_ip_send(ip_real)
        ip_val = ip_real
        num = 0
    time.sleep(seconds_sleep)
```
:::

本脚本要求``python>3.0``与对应的依赖.建议使用您的私人邮箱而非学校提供的邮箱作为收发端.在您的台式机或游戏本上直接运行脚本:

```bash
$ python ./mailer.py #将文件保存为mailer.py
```
该脚本便会自动检测当前IP地址并发送到您指定的接收端邮箱中,若检测到IP地址变动或经过您指定的等待小时数,脚本即重复发送IP地址.直接运行脚本会占用一个命令行窗口.

当您的移动端设备与您的主机连接到同一局域网时,您可以使用这个IP地址与对应的端口号连接到您的远程桌面、SSH、Jupyter等应用的服务端.

## 在图书馆使用远程桌面

在南科大的三个图书馆中，都有公共的电脑区域，使用此区域的电脑作为远程桌面的客户端也是不错的选择。（笔者自测可以提升 50% ~ 200% 不等的工作/学习效率。）

不同图书馆间电脑对比如下表。

| 图书馆 | 电脑设备数（约） | 操作系统   | 屏幕分辨率      | 连接速度 |
| ------ | ---------- | ---------- | --------------- | -------- |
| 琳恩   | ~50        | Windows 7  | 1080p, 100% DPI | 百兆     |
| 一丹   | ~100       | Windows 10 | 1080p, 125% DPI | 千兆     |
| 涵泳   | ~10        | Windows 10 | 1080p, 125% DPI | 千兆     |


在图书馆使用远程桌面的时候，以下几点可以帮助你获得更好的体验：

1. 如果觉得卡顿，可以在连接前在「体验」标签页中设置连接速度为 `WAN （10 Mbps 或更高速度，高延迟）` ，并取消勾选「拖动时显示窗口内容」和「菜单和窗口动画」。
2. 可以携带一条有线耳机插入主机的前端耳机插口（通常为绿色），以在远程桌面中使从服务端获取音频（听歌）。注意每次连接的时候远端设备音量会被设置为 100。
3. 使用完成后，在关闭远程桌面之外，最好手动关机/重启公用电脑。即使登出了公用电脑（恢复输入学号/密码界面），远程桌面的连接信息（IP，用户名）依然会保存在远程桌面应用中，存在泄露个人信息的可能。
4. 可以安装一个其他远程桌面软件（笔者自己使用 ToDesk）备用，以防因网络波动导致服务端 IP 改变无法连接。

> 注：在图书馆如果不想远程桌面，但是却想用公用电脑的屏幕，可以携带一根 HDMI 转 DVI 转接线。三个图书馆的公用电脑的屏幕的接口均为 VGA + DVI，其中 VGA 接口连接主机，DVI 接口未连接。不建议为了使用屏幕而手动拔开连接主机的 VGA 线，这回为图书馆的维护人员带来困扰。


