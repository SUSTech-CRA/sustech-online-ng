---
sidebar: auto
---

# 🌐网络与信息中心 (its@sustech.edu.cn)
[[toc]]

## 校内局域网

南科大的校内局域网主要分为主要包含教学/科研/业务计算机的科研教学网段(`172.18.0.0/16`)和包含大部分师生员工的个人有线与无线设备的普通网段(`10.16.0.0/13`)。

在普通网段中，`10.20.0.0/16`，`10.16.0.0/16`为有线网段，`10.22.0.0/16`为电信自费宽带网段。

学校为支持IPv6的设备分配前缀为`2001:DA8:201D::/48`的IPv6地址。(仅教育网可访问：[SUSTC6-CERNET2](http://www.nic.edu.cn/member-cgi/i6obj?query=SUSTC6-CERNET2))

### 接入网络

南科大师生员工无需为互联网服务付费（电信自费宽带除外）。设备获取的内网IP地址在遵循前述原则下与Mac地址绑定，在较长的时间内不会改变。

网络接入管理地址：[http://172.16.16.20:8900/home](http://172.16.16.20:8900/home)
* 为无法进行Web认证的设备，添加Mac无感知认证；
* 查看上网设备
* 查看上网记录

<Adsense_unit>
</Adsense_unit>

#### 有线网络

接入学校有线网络暂时无需认证，接入电信自费宽带的有线网络时需要验证购买过套餐的同学的学号与密码。

#### 无线网络

接入无线网络时，需要通过Web认证，输入学号与密码后才可上网，否则只能访问校内局域网，无线网络的认证地址为：[http://172.16.16.20:803/sustc_cas.php](http://172.16.16.20:803/sustc_cas.php)

如联网设备不支持通过Web进行验证（如路由器，开发板等），可以尝试使用同学制作的[第三方脚本](https://www.whexy.com/post/openwrt-zhi-jie-jue-nan-ke-da-xiao-yuan-wang-deng-lu-nan-ti/)进行联网，或是更改可进行Web认证设备的Mac地址为不支持Web认证设备的Mac地址代为认证。


::: details 同学制作的无线网络登陆脚本
``` bash
#!/bin/bash
source /etc/profile
set -e
curl https://cas.sustc.edu.cn/cas/login?service=http%3A%2F%2F172.16.16.20%3A803%2Fsustc_cas.php > a.txt
s=$(grep -o -E "on\"\ value=\"(.+?)\"" a.txt)
echo $s
s=${s#*\"}
s=${s#*\"}
s=${s%%\"*}
echo $s
unm=此处填入教/学工号
pwd=此处填入密码
curl "https://cas.sustc.edu.cn/cas/login?service=http%3A%2F%2F172.16.16.20%3A803%2Fsustc_cas.php" --data "username=$unm&password=$pwd&execution=$s&_eventId=submit&geolocation="
```
[给路由器写了一个登录南科大校园网的脚本](https://www.whexy.com/post/openwrt-zhi-jie-jue-nan-ke-da-xiao-yuan-wang-deng-lu-nan-ti/)

:::

#### 湖畔宿舍区域的有线网络<Badge text="需特别配置" type="warning"/>

湖畔区域墙上的网口仅能以百兆接入校园网。若需以千兆速度接入校园网，可使用AP上的网口接入校园网。**AP上的网口仅能访问校园网内网，但不能访问校外网络**，需通过校内中继访问外网。连接网络前，需要手动设置网关：

```
ip route add CIDR via 172.16.127.254
```

::: tip
如有任何疑问，可以通过[mai.sakurajima.qwq@gmail.com](mailto:mai.sakurajima.qwq@gmail.com?subject=湖畔AP访问外部网络咨询)咨询CRA的陈同学。
:::

### 其他有关网络的问题

#### 在路由器后获取IPv6地址

- [https://c.cra.moe/t/topic/38](https://c.cra.moe/t/topic/38)

#### 使用`dhcpclient`时获取不到IPv6地址

- 通常是因为学校的DHCPv6服务器不响应DHCPv6 Solicitation造成的。此问题常出现在安装Debian/Ubuntu（使用dhcpclient作为dhcp客户端的发行版中），如果希望快速解决，可以尝试讲dhcp客户端更改为`dhcpcd`。


## 互联网

### 出口

学校目前拥有4Gbps电信163出口带宽，2.5Gbps电信CN2出口带宽，以及1.5Gbps教育网出口带宽。[](https://biddingoffice.sustc.edu.cn/search/news/id/5085/pid)学校信息中心会将访问境外网站的流量发往CN2出口，因此学校内访问境外网站的质量会显著高于普通电信网络。

学校目前对普通网段设备不限速（Fair Use@Up to 1000Mbps），对科研教学网段限速50Mbps，对教育网IPv4限速20Mbps，暂不对教育网IPv6限速。

## 电信自费宽带<Badge text="不再推荐" type="warning"/>

::: warning
由于学校已经放宽网络限速，电信宽带的性价比较低。建议参考[湖畔宿舍区域的有线网络](#湖畔宿舍区域的有线网络)一节进行配置。
:::

中国电信为居住于湖畔宿舍区的同学提供自费电信宽带。

宽带速率可选50Mbps和100Mbps。其中，100Mbps宽带和手机卡套餐的总价为70元/月。

电信自费宽带也需要使用购买套餐同学的校园卡账户登录后才可使用，登陆方式为Web认证。也有同学制作了第三方脚本以方便快速验证。

[此处(PDF)](https://cdn.jsdelivr.net/gh/sustech-cra/sustech-online-ng@master/docs/service/network/CT_campus_broadband_plan.pdf)是一份电信为南科大同学提供的学生卡套餐的具体内容（含流量与宿舍宽带）。

::: details 同学制作的电信自费网络登陆脚本

``` bash
loginurl="https://cas.sustech.edu.cn/cas/login"
authip="219.134.142.194"
# Insert your CAS info below:
username="YOUR_USER_NAME_HERE"
password="YOUR_PASSWORD_HERE"

while [ true ]
do
	ret_code=`curl -I -s --connect-timeout 5 http://www.baidu.com -w %{http_code} | tail -n1`

	if [ $ret_code -ne 200 ] ; then
		echo "Attempting to log in the enet system"
		rm -f /tmp/cascookie

		# You may need to modify the following regex for different distros.
		routerip=$(ifconfig | grep -A 1 "^eth0.2" | grep -P -o "(?<=inet addr:).*(?=  Bcast)")
		eneturl="http://125.88.59.131:10001/sz/sz112/index.jsp?wlanuserip=$routerip&wlanacip=$authip"
		execution=$(curl --silent --cookie-jar /tmp/cascookies -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:71.0) Gecko/20100101 Firefox/71.0" -L "$eneturl"  | grep -o 'execution.*/><input type' | grep -o '[^"]\{50,\}')

		curl --silent --output /dev/null --cookie /tmp/cascookies --cookie-jar /tmp/cascookies -H "Content-Type: application/x-www-form-urlencoded" -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:71.0) Gecko/20100101 Firefox/71.0" -L -X POST "$loginurl" --data "username=$username&password=$password&execution=$execution&_eventId=submit&geolocation="
	else
		echo "Connected to Internet, recheck a second later"
	fi
	sleep 1s
done
```

[NewbieOrange/SUSTech-EnetLogin](https://github.com/NewbieOrange/SUSTech-EnetLogin)

:::

<Adsense_unit>
</Adsense_unit>

## 信息中心

信息中心老师的联系方式如下：

|  岗位名称  |  在岗人员名单  | 联系方式 |
| :--------: | :------------: | :------: |
|    主任    |     杨海琨     | 88010799 |
|   副主任   |     孙乔羽     | 88010798 |
|  运维管理  |     管立生     | 88010776 |
|  综合保障  |  刘敬、张炳坤  | 88010780 |
| 信息化管理 |     郑善辉     | 88010779 |
| 招生信息化 | 詹涵舒、韩少亮 | 88010789 |
| 教学信息化 |     宋伟中     | 88010788 |
| 综合信息化 |     朱朝阳     | 88010775 |
|  科技管理  |     尹荣荣     | 88010787 |
|  项目管理  |      陈毅      | 88010726 |

[网络信息中心（页面即将停用）](http://116.7.234.209/wlzx)

- 南科大信息中心沟通群：**434226835**

## 我可以请求信息中心做什么？

- 重置CAS密码
- 重置邮箱密码
- [申请回校VPN](./apply-for-vpn)
- [给打印机加纸](/service/unifound)
- 调整往某个网段的路由



**关于学校提供的更多信息服务，请见[服务](/service)一节**

## 选择合适的电子产品

- 电脑
- [平板](./choose-a-pad)
- [路由器](./choose-a-router)

## 校内网络使用技巧
- [远程桌面](./remote-desktop)

## 同学自行运营的千兆网络加速服务<Badge text="广告" type="tip"/>

::: tip
价格与体验均显著优于湖畔电信宽带，请通过[mai.sakurajima.qwq@gmail.com](mailto:mai.sakurajima.qwq@gmail.com?subject=千兆网络加速服务咨询)联系CRA的陈同学以获取详情。
:::