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
        number: '1.2', 
        name: '穿衣', 
        selfItem: 'dress',
        gradeOptions: [
          { value: '0', label: '0分-依赖他人' },
          { value: '1', label: '5分-需要部分帮助(能自己穿脱衣服或假肢或矫形器，但需他人帮助整理衣物、系扣/鞋带、拉拉链等)' },
          { value: '2', label: '10分-自理(自己系开纽扣，关开拉链和穿鞋、袜、假肢或矫形器等)' }
        ]
      },
      { 
        id: 'wash2', 
        number: '1.3', 
        name: '面部与口腔清洁', 
        selfItem: 'wash2',
        gradeOptions: [
          { value: '0', label: '0分-需要帮助' },
          { value: '1', label: '5分-独立洗脸、梳头、刷牙、剃须(不包括准备洗脸水、 梳子、牙刷等准备工作' },
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
        id: 'toilet3', 
        number: '1.6', 
        name: '用厕', 
        selfItem: 'toilet3',
        gradeOptions: [
          { value: '0', label: '0分-需要极大地帮助或完全依赖他人' },
          { value: '1', label: '需部分帮助(需他人帮忙整理衣裤、坐上/蹲上便器等)' },
          { value: '2', label: '10分-自理(能够使用厕纸、穿脱裤子等)' }
        ]
      },
      { 
        id: 'move2', 
        number: '1.7', 
        name: '平地行走', 
        selfItem: 'move2',
        gradeOptions: [
          { value: '0', label: '0分-卧床不起、不能步行、移动需要完全帮助' },
          { value: '1', label: '5分-在较大程度上依赖他人搀扶(≥2人)或依赖他人帮 助使用轮椅等辅助工具才能移动' },
          { value: '2', label: '10分-需少量帮助(需1人搀扶或需他人在旁提示或在他 人帮助下使用辅助工具)' },
          { value: '3', label: '15分-独立步行(自行使用辅助工具，在家及附近等日常 生活活动范围内独立步行)' }
        ]
      },
      { 
        id: 'move', 
        number: '1.8', 
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
        id: 'up_down', 
        number: '1.9', 
        name: '上下楼', 
        selfItem: 'up_down',
        gradeOptions: [
          { value: '0', label: '0分-不能，或需极大帮助或完全依赖他人' },
          { value: '1', label: '需要部分帮助(需扶着楼梯、他人搀扶、使用拐杖 或需他人在旁提示)' },
          { value: '2', label: '独立上下楼(可借助电梯等，如果使用支具，需可 独自完成穿、脱动作)' }
        ]
      },
      { 
        id: 'bath', 
        number: '1.10', 
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
    standardDesc: '0-4分，分数越高认知能力越好',
    gradeOptions: [
      { value: '0', label: '0分-无时间观念' },
      { value: '1', label: '1分-时间观念很差，年、月、日不清楚，可知上午、下午或白天、夜间' },
      { value: '2', label: '2分-时间观念较差，年、月、日不清楚，可知上半年或下半年或季节' },
      { value: '3', label: '3分-时间观念有些下降，年、月、日(或星期几)不能全部分清(相差两天或以上)' },
      { value: '4', label: '4分-时间观念(年、月)清楚，日期(或星期几)可相差一天' },
    ],
    items: [
      { id: 'timeOrientation', number: '2.1', name: '时间定向', selfItem: 'timeOrientation' },
      { id: 'personOrientation', number: '2.2', name: '人物定向', selfItem: 'personOrientation' },
      { id: 'spaceOrientation', number: '2.3', name: '空间定向', selfItem: 'spaceOrientation' },
      { id: 'memory', number: '2.4', name: '记忆力', selfItem: 'memory' },
    ],
  },
  {
    id: 'sensory',
    number: '三',
    name: '感知觉与沟通能力评估',
    standardDesc: '0-4分，分数越高感知觉与沟通能力越好',
    gradeOptions: [
      { value: '0', label: '0分-完全失明/失聪/不能沟通' },
      { value: '1', label: '1分-只能看到光、颜色和形状/大声说话才能部分听见/只能以简单的单词或手势表达大概意愿' },
      { value: '2', label: '2分-视力有限，看不清报纸大标题/正常交流有些困难/勉强可与他人交流，谈吐内容不清楚' },
      { value: '3', label: '3分-能看清楚大字体/轻声说话或说话距离超过2米时听不清/能够表达自己的需要或理解他人的话，但需要增加时间或给予帮助' },
      { value: '4', label: '4分-与日常生活能力相关的视力/听力基本正常/无困难，能与他人正常沟通和交流' },
    ],
    items: [
      { id: 'vision', number: '3.1', name: '视力', selfItem: 'vision', gradeOptions: [
        { value: '0', label: '0分-完全失明' },
        { value: '1', label: '1分-只能看到光、颜色和形状(大致轮廓),眼睛可随物体移动' },
        { value: '2', label: '2分-视力有限，看不清报纸大标题，但能辨认较大的物体' },
        { value: '3', label: '3分-能看清楚大字体，但看不清书报上的标准字体，辨别小物体有一定困难' },
        { value: '4', label: '4分-与日常生活能力相关的视力(如阅读书报、看电视等)基本正常' },
      ]},
      { id: 'hearing', number: '3.2', name: '听力', selfItem: 'hearing', gradeOptions: [
        { value: '0', label: '0分-完全失聪' },
        { value: '1', label: '1分-讲话者大声说话或说话很慢，才能部分听见' },
        { value: '2', label: '2分-正常交流有些困难，需在安静的环境大声说话才能听到' },
        { value: '3', label: '3分-在轻声说话或说话距离超过2米时听不清' },
        { value: '4', label: '4分-与日常生活习惯相关的听力基本正常(如能听到门铃、电视、电话等声音)' },
      ]},
      { id: 'communication', number: '3.3', name: '沟通能力', selfItem: 'communication', gradeOptions: [
        { value: '0', label: '0分-完全不能理解他人的言语，也无法表达' },
        { value: '1', label: '1分-不能完全理解他人的话，只能以简单的单词或手势表达大概意愿' },
        { value: '2', label: '2分-勉强可与他人交流，谈吐内容不清楚，需频繁重复或简化口头表达' },
        { value: '3', label: '3分-能够表达自己的需要或理解他人的话，但需要增加时间或给予帮助' },
        { value: '4', label: '4分-无困难，能与他人正常沟通和交流' },
      ]},
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
  timeOrientation: {
    '0': '无时间观念',
    '1': '时间观念很差',
    '2': '时间观念较差',
    '3': '时间观念有些下降',
    '4': '时间观念清楚',
  },
  personOrientation: {
    '0': '不认识任何人',
    '1': '只认识自己或极少数日常同住的亲人或照护者',
    '2': '能认识一半日常同住的亲人或照护者',
    '3': '能认识大部分共同生活居住的人',
    '4': '认识长期共同一起生活的人',
  },
  spaceOrientation: {
    '0': '不能单独外出，无空间观念',
    '1': '不能单独外出，少量知道自己居住或生活所在地的地址',
    '2': '不能单独外出，但知道较多有关自己日常生活的地址',
    '3': '不能单独外出，但能准确知道自己日常生活所在地的地址',
    '4': '能在日常生活范围内单独外出',
  },
  hearing: {
    '0': '完全失聪',
    '1': '讲话者大声说话或说话很慢，才能部分听见',
    '2': '正常交流有些困难，需在安静的环境大声说话才能听到',
    '3': '在轻声说话或说话距离超过2米时听不清',
    '4': '与日常生活习惯相关的听力基本正常',
  },
  communication: {
    '0': '完全不能理解他人的言语，也无法表达',
    '1': '不能完全理解他人的话，只能以简单的单词或手势表达大概意愿',
    '2': '勉强可与他人交流，谈吐内容不清楚，需频繁重复或简化口头表达',
    '3': '能够表达自己的需要或理解他人的话，但需要增加时间或给予帮助',
    '4': '无困难，能与他人正常沟通和交流',
  },
};
