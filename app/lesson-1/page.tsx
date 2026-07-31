"use client";

import { ActionCard, CoursePlayer, MistakeList, ReadingChapter, type CourseStep } from "../components/course-player";
const R = ReadingChapter;

const steps: CourseStep[] = [
  {title:"现在适合开口吗？",short:"情境判断",type:"练习",time:"1分钟",summary:"先看时机，不急着准备漂亮话",practice:{context:"入职第一天，邻座同事戴着耳机，正在快速回复消息。",question:"现在怎样做更合适？",choices:[
    {text:"马上拍肩膀自我介绍",correct:false,feedback:"突然打断会增加对方压力。"},
    {text:"先观察，等对方摘下耳机或停下手里的事",correct:true,feedback:"回答正确。自然开口先确认对方是否方便交流。"},
    {text:"永远等对方主动",correct:false,feedback:"等待合适时机不等于放弃行动。"}]}},
  {title:"自然开口真正要解决什么？",short:"学习目标",type:"阅读",time:"2分钟",summary:"发出低压力的友好信号",content:<R lead="第一次开口不需要聊得精彩，只要让双方从完全陌生变成可以打招呼。" sections={[
    {title:"目标要小",text:"不求立刻熟悉、被喜欢或证明自己外向。"},
    {title:"学完要做到",items:["判断对方是否方便交流","从共同环境找话题","只放出一个轻量问题","根据回应决定继续或收尾"]},
  ]} quote="自然开口不是制造精彩谈话，而是发出对方容易接住的友好信号。"/>},
  {title:"核心原则：轻连接",short:"轻连接",type:"阅读",time:"3分钟",summary:"目标轻、话题近、压力小",content:<R lead="轻不等于敷衍，而是让第一次交流没有过重任务。" sections={[
    {title:"目标轻",text:"先认识，不求马上熟悉。"},
    {title:"话题近",text:"从双方都看得到的环境、工作和共同经历开始。"},
    {title:"压力小",text:"一次只问一个问题，让对方容易回答也容易停止。"},
  ]}/>},
  {title:"开口三问",short:"开口三问",type:"阅读",time:"3分钟",summary:"时机、共同点、交流目的",content:<R lead="开口前用三问完成快速判断。" sections={[
    {title:"现在方便吗？",text:"观察耳机、屏幕、语速和身体朝向。"},
    {title:"我们有什么共同点？",text:"工位、会议、午餐、通勤和当前任务都可以。"},
    {title:"我这次只想完成什么？",text:"问路、请教、打招呼，目标越清楚越自然。"},
  ]}/>},
  {title:"Small Talk话题工具",short:"话题工具",type:"阅读",time:"3分钟",summary:"从近处找双方都接得住的话题",content:<R lead="小话题的价值，是安全地启动关系。" sections={[
    {title:"适合的话题",items:["共同环境","共同任务","轻量经历","具体请教"]},
    {title:"先避开的话题",items:["工资和家庭等隐私","评价领导同事","过度赞美","需要长篇解释的沉重问题"]},
  ]}/>},
  {title:"自然开口五步法",short:"五步法",type:"阅读",time:"4分钟",summary:"观察、开场、轻问、接话、结束",content:<R lead="不需要背台词，只要记住动作顺序。" sections={[
    {title:"1. 观察",text:"确认对方有短暂交流空间。"},
    {title:"2. 开场",text:"用称呼、眼神或共同环境建立注意。"},
    {title:"3. 轻问",text:"一次只给一个容易回答的问题。"},
    {title:"4. 接话",text:"先回应对方，再补一点自己。"},
    {title:"5. 结束",text:"回应简短时友好收尾，不连续追问。"},
  ]}/>},
  {title:"三个典型场景",short:"场景运用",type:"阅读",time:"4分钟",summary:"邻座、茶水间和跨部门请教",content:<R lead="场景不同，轻连接的目标和压力控制不变。" sections={[
    {title:"第一次见邻座",text:"“你好，我是今天入职的小林，以后这边的项目还要多请教。”"},
    {title:"茶水间相遇",text:"从咖啡机、午餐或刚结束的会议开始，一次只问一个点。"},
    {title:"跨部门请教",text:"先说明来意和问题范围，让对方知道只需付出多大时间。"},
  ]}/>},
  {title:"看回应：继续还是收尾？",short:"回应分支",type:"练习",time:"2分钟",summary:"根据回应强度决定下一步",practice:{context:"你问同事午饭一般去哪里，对方只回答“楼下”。",question:"下一步怎样做？",choices:[
    {text:"连续追问去哪家、吃什么、和谁去",correct:false,feedback:"简短回应通常表示此刻不想展开。"},
    {text:"说“好，谢谢，我中午去看看”，自然结束",correct:true,feedback:"回答正确。友好收尾已经完成一次轻连接。"},
    {text:"什么也不说马上离开",correct:false,feedback:"可以停止，但补一句感谢会更自然。"}]}},
  {title:"常见错误与综合练习",short:"错误练习",type:"练习",time:"3分钟",summary:"避免盘问、过度赞美和隐私越界",practice:{before:<MistakeList items={[["连续提问","像采访而不是交流"],["目标过重","急着证明自己合群"],["过度赞美","让人难以自然回应"],["忽视信号","对方忙碌仍强行展开"],["一次冷场就否定自己","把情境误解为能力"]]}/>,context:"你发现同事也坐2号线上班，想自然多聊两句。",question:"哪句话更合适？",choices:[
    {text:"“你住哪里、几点出门、以前在哪工作？”",correct:false,feedback:"这是连续索取私人信息。"},
    {text:"“原来你也坐2号线，我今天换乘差点走错。你一般在哪站换？”",correct:true,feedback:"先回应共同点，再分享一点自己，只放出一个轻量问题。"},
    {text:"“你气质真好，一看就特别厉害。”",correct:false,feedback:"初次交流中过度赞美会显得用力。"}]}},
  {title:"带走一张行动卡",short:"行动卡",type:"总结",time:"1分钟",summary:"下次开口时直接照着做",content:<ActionCard title={<>第一次开口<br/>只完成一次轻连接</>} points={["先看对方现在是否方便","从共同环境和任务找话题","一次只问一个轻量问题","先回应，再补一点自己","简短回应时友好结束"]} flow={["观察","开场","轻问","接话","结束"]} quote="目标轻、话题近、压力小。"/>},
];

export default function Page(){return <CoursePlayer lessonNumber={1} lessonTitle="新人如何自然开口" steps={steps}/>;}
