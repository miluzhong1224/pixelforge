export interface PromptTemplate {
  id: string;
  title: string;
  category: string;
  prompt: string;
  negativePrompt?: string;
  emoji: string;
}

export const TEMPLATES: PromptTemplate[] = [
  // 写实摄影
  {
    id: 'photo-product',
    title: '电商产品图',
    category: '写实摄影',
    emoji: '📦',
    prompt: '高端产品摄影，纯白背景，专业影棚灯光，超高清细节，商业级画质',
    negativePrompt: '模糊，杂乱背景，低画质，过度锐化',
  },
  {
    id: 'photo-portrait',
    title: '人像写真',
    category: '写实摄影',
    emoji: '📷',
    prompt: '专业人像摄影，柔和的自然光，浅景深背景虚化，电影感色调，高清皮肤质感',
    negativePrompt: '过度磨皮，变形，诡异表情，低分辨率',
  },
  {
    id: 'photo-landscape',
    title: '风光大片',
    category: '写实摄影',
    emoji: '🏔️',
    prompt: '壮丽自然风光，黄金时刻光线，超广角视角，大气磅礴的云层，8K超高清',
    negativePrompt: '过度处理，HDR效果，人物，建筑，水印',
  },
  // 插画风格
  {
    id: 'illus-flat',
    title: '扁平插画',
    category: '插画风格',
    emoji: '🎨',
    prompt: '扁平化矢量插画风格，简洁几何图形，柔和配色，现代设计感，干净线条',
    negativePrompt: '写实，3D，照片，复杂背景，噪点',
  },
  {
    id: 'illus-watercolor',
    title: '水彩手绘',
    category: '插画风格',
    emoji: '🖌️',
    prompt: '水彩手绘风格，柔和的色彩过渡，纸张纹理，艺术感笔触，留白美感',
    negativePrompt: '数码感，过于平滑，矢量图，照片',
  },
  {
    id: 'illus-anime',
    title: '二次元动漫',
    category: '插画风格',
    emoji: '✨',
    prompt: '日系动漫风格，精致线稿，赛璐璐上色，明亮色彩，角色立绘质感',
    negativePrompt: '写实，3D渲染，照片质感，欧美画风',
  },
  // 3D 渲染
  {
    id: '3d-c4d',
    title: 'C4D 质感',
    category: '3D 渲染',
    emoji: '💎',
    prompt: 'C4D 3D渲染风格，柔和的全局光照，亚克力材质，渐变色彩，气泡美学，极简构图',
    negativePrompt: '照片，2D插画，杂乱，低多边形',
  },
  {
    id: '3d-isometric',
    title: '等距场景',
    category: '3D 渲染',
    emoji: '🏗️',
    prompt: '等距视角3D场景，低多边形风格，柔和灯光，丰富细节，游戏资产质感',
    negativePrompt: '透视变形，写实材质，2D平面',
  },
  // 创意风格
  {
    id: 'creative-cyberpunk',
    title: '赛博朋克',
    category: '创意风格',
    emoji: '🌃',
    prompt: '赛博朋克风格，霓虹灯光，雨夜城市街道，蓝紫色调，未来科技感，高对比度',
    negativePrompt: '白天，自然光，乡村，复古',
  },
  {
    id: 'creative-pixel',
    title: '像素艺术',
    category: '创意风格',
    emoji: '👾',
    prompt: '像素艺术风格，16-bit 游戏画面质感，清晰像素块，复古游戏色彩，有限调色板',
    negativePrompt: '平滑边缘，写实，高分辨率渲染',
  },
  {
    id: 'creative-ukiyoe',
    title: '浮世绘',
    category: '创意风格',
    emoji: '🌊',
    prompt: '日本浮世绘风格，葛饰北斋风格海浪，木版画纹理，传统配色，平面构图',
    negativePrompt: '3D，照片，现代风格，西方绘画',
  },
  {
    id: 'creative-chinese',
    title: '水墨国风',
    category: '创意风格',
    emoji: '🏮',
    prompt: '中国传统水墨画风格，宣纸纹理，墨色浓淡变化，留白意境，工笔细节',
    negativePrompt: '油画，水彩，照片，现代风格',
  },
];

export const CATEGORIES = ['推荐', '写实摄影', '插画风格', '3D 渲染', '创意风格'] as const;
