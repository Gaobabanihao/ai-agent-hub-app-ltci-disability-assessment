export interface GradeOption {
  value: string;
  label: string;
}

export interface AssessmentItemDef {
  id: string;
  number: string;
  name: string;
  selfItem: string;
  gradeOptions?: GradeOption[];
}

export interface AssessmentCategoryDef {
  id: string;
  number: string;
  name: string;
  standardDesc: string;
  gradeOptions: GradeOption[];
  items: AssessmentItemDef[];
}

export const ASSESSMENT_CATEGORIES: AssessmentCategoryDef[] = [
  {
    id: 'daily-living',
    number: '一',
    name: '日常生活活动能力评估',
    // 与接口文档保持一致：日常生活维度使用 0/1/2 三档。
    standardDesc: '0=依赖 / 1=部分独立 / 2=独立',
    gradeOptions: [
      { value: '0', label: '0级 - 依赖' },
      { value: '1', label: '1级 - 部分独立' },
      { value: '2', label: '2级 - 独立' },
    ],
    items: [
      { 
        id: 'eat', 
        number: '1.1', 
        name: '进食', 
        selfItem: 'eat',
        gradeOptions: [
          { value: '0', label: '0分-较大或完全依赖，或有留置营养管' },
          { value: '1', label: '5分-需部分帮助(夹菜、盛饭)' },
          { value: '2', label: '10分-自理(在合理时间内能独立使用餐具进食各种食物，可使用辅助工具独立完成进食，但不包括做饭)' }
        ]
      },
      { 
        id: 'dress', 
        number: '1.3', 
        name: '穿衣', 
        selfItem: 'dress',
        gradeOptions: [
          { value: '0', label: '0分-依赖他人' },
          { value: '1', label: '5分-需要部分帮助(能自己穿脱衣服或假肢或矫形器，但需他人帮助整理衣物、系扣/鞋带、拉拉链等)' },
          { value: '2', label: '10分-自理(自己系开纽扣，关开拉链和穿鞋、袜、假肢或矫形器等)' }
        ]
      },
      { 
        id: 'wash', 
        number: '1.2', 
        name: '洗澡', 
        selfItem: 'wash',
        gradeOptions: [
          { value: '0', label: '0分-需要帮助' },
          { value: '1', label: '5分-独立洗脸、梳头、刷牙、剃须(不包括准备洗脸水、梳子、牙刷等准备工作)' }
        ]
      },
      { 
        id: 'toilet', 
        number: '1.4', 
        name: '大便控制', 
        selfItem: 'toilet',
        gradeOptions: [
          { value: '0', label: '0分-失禁(平均每周≥1次或完全不能控制大便排泄，需要完全依赖他人)' },
          { value: '1', label: '5分-偶有失禁(每周<1次),或需要他人提示或便秘需要人工帮助取便' },
          { value: '2', label: '10分-能控制' }
        ]
      },
      { 
        id: 'toilet2', 
        number: '1.5', 
        name: '小便控制', 
        selfItem: 'toilet2',
        gradeOptions: [
          { value: '0', label: '0分-失禁(平均每天≥1次或经常尿失禁，完全需要他人帮忙完成排尿行为；或留置导尿管，但无法自行管理导尿管)' },
          { value: '1', label: '5分-偶有失禁(每24h<1次，但每周>1次),或需要他人提示)' },
          { value: '2', label: '10分-能控制(或留置导尿管，可自行管理导尿管)' }
        ]
      },
      { 
        id: 'move', 
        number: '1.6', 
        name: '床椅转移', 
        selfItem: 'move',
        gradeOptions: [
          { value: '0', label: '0分-完全依赖他人，不能坐' },
          { value: '1', label: '5分-需大量帮助(至少2人，身体帮助),能坐' },
          { value: '2', label: '10分-需少量帮助(1人搀扶或使用拐杖等辅助工具或扶着墙、周围设施，转移时需他人在旁监护、提示)' },
          { value: '3', label: '15分-自理' }
        ]
      },
      { 
        id: 'bath', 
        number: '1.7', 
        name: '洗澡', 
        selfItem: 'bath',
        gradeOptions: [
          { value: '0', label: '0分-洗澡过程中需他人帮助' },
          { value: '1', label: '5分-准备好洗澡水后，可自己独立完成' }
        ]
      }
    ],
  },
  {
    id: 'cognitive',
    number: '二',
    name: '认知能力评估',
    standardDesc: '0=重度认知障碍 / 1=中度认知障碍 / 2=轻度认知障碍 / 3=认知功能正常',
    gradeOptions: [
      { value: '0', label: '0级 - 重度认知障碍' },
      { value: '1', label: '1级 - 中度认知障碍' },
      { value: '2', label: '2级 - 轻度认知障碍' },
      { value: '3', label: '3级 - 认知功能正常' },
    ],
    items: [
      { id: 'memory', number: '2.1', name: '记忆力', selfItem: 'memory' },
      { id: 'orientation', number: '2.2', name: '定向力', selfItem: 'orientation' },
    ],
  },
  {
    id: 'emotion',
    number: '三',
    name: '情绪与行为评估',
    standardDesc: '0=严重情绪行为异常 / 1=频繁情绪异常 / 2=偶有情绪波动 / 3=情绪行为正常',
    gradeOptions: [
      { value: '0', label: '0级 - 严重情绪行为异常' },
      { value: '1', label: '1级 - 频繁情绪异常' },
      { value: '2', label: '2级 - 偶有情绪波动' },
      { value: '3', label: '3级 - 情绪行为正常' },
    ],
    items: [
      { id: 'emotion', number: '3.1', name: '情绪稳定性', selfItem: 'emotion' },
      { id: 'social', number: '3.2', name: '社交能力', selfItem: 'social' },
    ],
  },
  {
    id: 'sensory',
    number: '四',
    name: '感知觉与沟通能力评估',
    standardDesc: '0=重度障碍 / 1=中度障碍 / 2=轻度障碍 / 3=感知觉正常',
    gradeOptions: [
      { value: '0', label: '0级 - 重度障碍' },
      { value: '1', label: '1级 - 中度障碍' },
      { value: '2', label: '2级 - 轻度障碍' },
      { value: '3', label: '3级 - 感知觉正常' },
    ],
    items: [
      { id: 'vision', number: '4.1', name: '视觉', selfItem: 'vision' },
      { id: 'language', number: '4.2', name: '语言表达', selfItem: 'language' },
    ],
  },
];

export const SELF_ASSESSMENT_MAPPING: Record<string, Record<string, string>> = {
  eat: {
    '0': '依赖（不能独立完成，需鼻饲或鼻食/或全部喂）',
    '1': '部分独立（自己能吃，但需辅助）',
    '2': '独立（无须帮助）',
  },
  wash: {
    '0': '依赖（不能洗澡、或大部分需帮助洗）',
    '1': '部分独立（需帮助洗一部分）',
    '2': '独立（能自己进出浴室，独立洗澡）',
  },
  dress: {
    '0': '依赖（不能独立完成，完全不能穿衣）',
    '1': '部分独立（能独立拿取衣服及穿上，需帮助系鞋带）',
    '2': '独立（无须帮助，能自行穿脱衣物）',
  },
  toilet: {
    '0': '依赖（不能自控，失控、需帮助处理大小便）',
    '1': '部分独立（偶尔失控）',
    '2': '独立（自己能够完全控制）',
  },
  move: {
    '0': '依赖（不能独立完成，卧床不起）',
    '1': '部分独立（不能独立完成，需帮助上下床椅）',
    '2': '独立（无须帮助，能自行移动）',
  },
  bath: {
    '0': '依赖（不能独立完成，需他人帮助）',
    '1': '部分独立（准备好洗澡水后，可自己独立完成）',
  },
  memory: {
    '0': '重度认知障碍',
    '1': '中度认知障碍',
    '2': '轻度认知障碍',
    '3': '认知功能正常',
  },
  orientation: {
    '0': '重度认知障碍',
    '1': '中度认知障碍',
    '2': '轻度认知障碍',
    '3': '认知功能正常',
  },
  emotion: {
    '0': '严重情绪行为异常',
    '1': '频繁情绪异常',
    '2': '偶有情绪波动',
    '3': '情绪行为正常',
  },
  social: {
    '0': '严重情绪行为异常',
    '1': '频繁情绪异常',
    '2': '偶有情绪波动',
    '3': '情绪行为正常',
  },
  vision: {
    '0': '重度障碍',
    '1': '中度障碍',
    '2': '轻度障碍',
    '3': '感知觉正常',
  },
  language: {
    '0': '重度障碍',
    '1': '中度障碍',
    '2': '轻度障碍',
    '3': '感知觉正常',
  },
};
