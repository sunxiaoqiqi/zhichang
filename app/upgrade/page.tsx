import { effectiveAccessPlan } from "../auth/access";
import { getCurrentUser } from "../auth/session";

export default async function UpgradePage({ searchParams }: { searchParams: Promise<{ reason?: string; lesson?: string }> }) {
  const user = await getCurrentUser();
  const params = await searchParams;
  const plan = user ? effectiveAccessPlan(user) : "free";
  const lessonNumber = Number(params.lesson);
  const reason = params.reason === "training"
    ? "你的免费训练额度已经使用完毕。"
    : params.reason === "lesson" && lessonNumber > 1
      ? `第 ${lessonNumber} 课属于收费版内容，免费版可试读第 1 课。`
      : "免费版可试读第 1 课并完成 1 次训练。";

  return <main className="upgradePage"><section className="upgradeCard">
    <header><a className="brand" href="/"><span className="brandMark">61</span><span>职场沟通训练营</span></a><span className={plan === "paid" ? "paid" : "free"}>{plan === "paid" ? "收费版" : "免费版"}</span></header>
    {plan === "paid" ? <div className="upgradeAlready"><small>ACCESS ENABLED</small><h1>你的收费版权限已开通</h1><p>现在可以学习全部 26 课，并无限次使用训练模式。</p><div><a className="primary" href="/">返回首页</a><a href="/training">开始训练</a></div></div> : <>
      <div className="upgradeIntro"><small>UPGRADE ACCESS</small><h1>开通收费版，继续完整训练</h1><p>{reason} 请联系管理员为当前账号开通收费版，开通后重新进入页面即可生效。</p></div>
      <div className="planCompare"><article><span>当前版本</span><h2>免费版</h2><ul><li>试读第 1 课</li><li>体验 1 次 5 题训练</li><li>保留学习与收藏记录</li></ul></article><article className="recommended"><span>完整权限</span><h2>收费版</h2><ul><li>解锁全部 26 课</li><li>无限次智能训练</li><li>保留全部学习数据</li></ul></article></div>
      <div className="contactAdmin"><span>开通方式</span><div><small>把账号名发送给管理员</small><strong>{user?.account ?? "当前账号"}</strong></div><p>管理员在“用户管理”中点击“开通收费版”后，权限会立即生效。</p></div>
      <footer><a className="primary" href="/lesson-1">试读第一课</a><a href="/">返回首页</a></footer>
    </>}
  </section></main>;
}
