import re
import tqdm
import aiohttp
import asyncio
from pyquery import PyQuery as pq
from typing import Dict, Tuple, List

BASE_URL = "https://www.sustech.edu.cn"
COLLEGES_URL = "https://www.sustech.edu.cn/zh/faculty_members.html"


async def fetch(session, url):
    async with session.get(url) as response:
        return await response.text()


async def get_college(session) -> Dict[str, List[Tuple[str, str]]]:
    res= {}
    dom= pq(await fetch(session, COLLEGES_URL))
    colleges= dom(".faculty_members ul")
    for ul in colleges.items():
        college_name= ul("h2").text()
        res[college_name]= []
        for departments_dom in ul("li a").items():
            res[college_name].append(
                (departments_dom.text(), BASE_URL + departments_dom.attr("href")))
    return res


async def get_professors(session, link) -> List[Tuple[str, str]]:
    res=[]
    dom=pq(await fetch(session, link))
    for prof_dom in dom(".list2").items():
        name=prof_dom(".name").text()
        link=BASE_URL + prof_dom("a").attr("href")
        res.append((name, link))
    return res

email_pattern=re.compile(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}')
async def get_professor_emails(session, link) -> List[str]:
    dom=pq(await fetch(session, link))
    raw_text=dom(".message-left .clearfix").eq(-1).text().replace(' ', '')
    res = email_pattern.findall(raw_text)
    if len(res) == 0 and ("at" in raw_text or "AT" in raw_text):
        return [raw_text]
    return res


async def get_email_formated(session) -> str:
    res = """---\nsidebar: auto\n---\n\n# 教授邮件列表\n\n"""
    colleges=await get_college(session)
    for key in colleges:
        res += f"## {key}\n"
        for department in colleges[key]:
            name, link=department
            res += f"### {name}\n\n| 姓名 | 邮箱 |\n| ---------- | ---------- |\n"
            professors=await get_professors(session, link)
            for prof in tqdm.tqdm(professors):
                p_name, p_link=prof
                p_emails=await get_professor_emails(session, p_link)
                if len(p_emails) == 0:
                    res += f"| [{p_name}]({p_link}) | 官网未找到邮箱 |\n"
                else:
                    res += f"| [{p_name}]({p_link}) | {' '.join(p_emails)} |\n"
            res += "\n"
        res += "\n"
    return res


async def main():
    async with aiohttp.ClientSession(connector = aiohttp.TCPConnector(ssl=False)) as session:
        res = await get_email_formated(session)
        with open("res.md", "w") as f:
            f.write(res)

asyncio.run(main())
