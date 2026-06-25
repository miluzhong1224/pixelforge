import { NextResponse } from 'next/server';

const SUPABASE_URL = 'https://pnowmoquisuqomhfsvza.supabase.co';
const SUPABASE_KEY = 'sb_publishable_FBMRbDCZw-kZuhuHjDwtQQ_ajLWMtf6';
const H = { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sort = searchParams.get('sort') || 'latest';
    const order = sort === 'popular' ? 'reuse_count.desc' : 'createdAt.desc';

    // 只查已公开作品（share_slug 不为空 = 用户主动公开到社区）
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/images?select=id,prompt,result_urls,width,height,createdAt,user_id,share_slug&share_slug=not.is.null&order=${order}&limit=50`,
      { headers: H }
    );

    if (!res.ok) {
      const fallback: Any[] = [];
      return NextResponse.json({ images: fallback });
    }

    const images: Any[] = await res.json();

    // 批量查用户名
    const userIds = [...new Set(images.map((i) => i.user_id as string))];
    const usersMap: Record<string, string> = {};
    for (const uid of userIds) {
      try {
        const uRes = await fetch(`${SUPABASE_URL}/rest/v1/users?select=name,email&id=eq.${uid}&limit=1`, { headers: H });
        if (uRes.ok) {
          const list: Any[] = await uRes.json();
          if (list?.length) usersMap[uid] = list[0].name || (list[0].email || '').split('@')[0] || '匿名';
        }
      } catch { usersMap[uid] = '匿名'; }
    }

    const enriched = images.map((i) => ({
      ...i,
      user_name: usersMap[i.user_id] || '匿名',
      reuse_count: i.reuse_count || 0,
    }));

    return NextResponse.json({ images: enriched });
  } catch (error) {
    console.error('Explore error:', error);
    return NextResponse.json({ error: '加载失败' }, { status: 500 });
  }
}
