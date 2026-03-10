# api 接口文档
基础URL：http://localhost:8080/api
数据格式：所有请求和响应均为 JSON 格式（文件上传除外）
# ltci基础接口
## 一、被保险人管理接口
### 创建被保险人
- 接口名称：创建被保险人
- URL：/insured-persons
- 方法：POST
- 功能说明：保存客户基本信息
  请求参数（Body JSON）：
  |参数名|类型|必填|说明|示例|
  |name|String|是|被保险人姓名|"张三"|
  |idCard|String|是|身份证号|"110101199001011234"|
  |phone|String|否|联系电话|"13800138000"|
  |insuranceArea|String|否|参保地|"北京市朝阳区"|
  |assessor|String|否|评估人员|"李医生"|

            参数名
            类型
            必填
            说明
            示例
            name
            String
            是
            被保险人姓名
            "张三"
            idCard
            String
            是
            身份证号
            "110101199001011234"
            phone
            String
            否
            联系电话
            "13800138000"
            insuranceArea
            String
            否
            参保地
            "北京市朝阳区"
            assessor
            String
            否
            评估人员
            "李医生"
请求示例：
json
{"name": "张三","idCard": "110101199001011234","phone": "13800138000","insuranceArea": "北京市朝阳区","assessor": "李医生"}
返回示例：
json
{"id": 1,"name": "张三","idCard": "110101199001011234","phone": "13800138000","insuranceArea": "北京市朝阳区","assessor": "李医生","createdAt": "2026-03-06T10:30:00","updatedAt": "2026-03-06T10:30:00"}
## 二、评估管理接口
### 2.1 创建评估草稿
- 接口名称：创建评估草稿
- URL：/assessments
- 方法：POST
- 功能说明：开始一次新的评估，返回assessmentId
  请求参数（Body JSON）：
  |参数名|类型|必填|说明|示例|
  |insuredPersonId|Integer|是|被保险人ID|1|
  |idCard|String|是|身份证号|"110101199001011234"|
  |assessmentDate|String|是|评估日期|"2026-03-06"|
  |assessor|String|是|评估人员|"李医生"|
  |name（新增）|String|是| | |

            参数名
            类型
            必填
            说明
            示例
            insuredPersonId
            Integer
            是
            被保险人ID
            1
            idCard
            String
            是
            身份证号
            "110101199001011234"
            assessmentDate
            String
            是
            评估日期
            "2026-03-06"
            assessor
            String
            是
            评估人员
            "李医生"
            name（新增）
            String
            是


请求示例：
json
{  "insuredPersonId": 1,  "idCard": "110101199001011234",  "name": "张三",  "assessmentDate": "2024-05-21",  "assessor": "李医生"}
返回示例：
json
{"id": 1001,"insuredPersonId": 1,"idCard": "110101199001011234","assessmentDate": "2026-03-06",
"name": "张三","assessor": "李医生","status": 0,"createdAt": "2026-03-06T10:30:00"}
### 2.2 提交评估结果
- 接口名称：提交评估结果
- URL：/assessments/{assessmentId}/submit
- 方法：POST
- 功能说明：提交所有11个评估项目的打分，后端自动计算失能等级
  路径参数：
  |参数名|类型|必填|说明|示例|
  |assessmentId|Integer|是|评估记录ID|1001|

            参数名
            类型
            必填
            说明
            示例
            assessmentId
            Integer
            是
            评估记录ID
            1001
请求参数（Body JSON）：
|参数名|类型|必填|说明|示例|
|items|Array|是|评估项目列表|见下方|

            参数名
            类型
            必填
            说明
            示例
            items
            Array
            是
            评估项目列表
            见下方
items 数组中的每个对象：
|参数名|类型|必填|说明|示例|
|category|Integer|是|类别：1-日常生活 2-认知 3-情绪 4-感知觉|1|
|itemCode|String|是|项目代码|"eat"|
|itemName|String|是|项目名称|"进食"|
|grade|Integer|是|评定等级 0/1/2/3|2|
|selfGrade|Integer|否|客户自评等级|2|
|assessmentNote|String|否|评估意见|"能独立完成，无困难"|

            参数名
            类型
            必填
            说明
            示例
            category
            Integer
            是
            类别：1-日常生活 2-认知 3-情绪 4-感知觉
            1
            itemCode
            String
            是
            项目代码
            "eat"
            itemName
            String
            是
            项目名称
            "进食"
            grade
            Integer
            是
            评定等级 0/1/2/3
            2
            selfGrade
            Integer
            否
            客户自评等级
            2
            assessmentNote
            String
            否
            评估意见
            "能独立完成，无困难"
完整的11个项目代码对照表：
|类别|项目代码|项目名称|grade说明|
|1|eat|进食|0-依赖 1-部分独立 2-独立|
|1|wash|洗漱|同上|
|1|dress|穿衣|同上|
|1|toilet|如厕|同上|
|1|move|移动|同上|
|2|memory|记忆力|0-重度 1-中度 2-轻度 3-正常|
|2|orientation|定向力|同上|
|3|emotion|情绪稳定性|0-严重 1-频繁 2-偶有 3-正常|
|3|social|社交能力|同上|
|4|vision|视觉|0-重度 1-中度 2-轻度 3-正常|
|4|language|语言表达|同上|

            类别
            项目代码
            项目名称
            grade说明
            1
            eat
            进食
            0-依赖 1-部分独立 2-独立
            1
            wash
            洗漱
            同上
            1
            dress
            穿衣
            同上
            1
            toilet
            如厕
            同上
            1
            move
            移动
            同上
            2
            memory
            记忆力
            0-重度 1-中度 2-轻度 3-正常
            2
            orientation
            定向力
            同上
            3
            emotion
            情绪稳定性
            0-严重 1-频繁 2-偶有 3-正常
            3
            social
            社交能力
            同上
            4
            vision
            视觉
            0-重度 1-中度 2-轻度 3-正常
            4
            language
            语言表达
            同上
请求示例：
json
{"items": [{"category": 1,"itemCode": "eat","itemName": "进食","grade": 2,"selfGrade": 2,"assessmentNote": "能独立使用餐具"},{"category": 1,"itemCode": "wash","itemName": "洗漱","grade": 1,"assessmentNote": "需部分协助"}// ... 共11项]}
返回示例：
json
{"id": 1001,"insuredPersonId": 1,"idCard": "110101199001011234","assessmentDate": "2026-03-06","assessor": "李医生","finalGrade": "重度失能","finalScore": 2.3,"itemCount": 11,"status": 1,"submitTime": "2026-03-06T11:30:00"}
## 三、文件上传接口
### 3.1 上传自评表
- 接口名称：上传自评表
- URL：/files/{assessmentId}/self-assessment
- 方法：POST
- 功能说明：上传自评表文件（图片/PDF）
  路径参数：
  |参数名|类型|必填|说明|示例|
  |assessmentId|Integer|是|评估记录ID|1001|

            参数名
            类型
            必填
            说明
            示例
            assessmentId
            Integer
            是
            评估记录ID
            1001
请求格式：multipart/form-data
|参数名|类型|必填|说明|示例|
|file|File|是|自评表文件|图片或PDF|

            参数名
            类型
            必填
            说明
            示例
            file
            File
            是
            自评表文件
            图片或PDF
返回示例：
json
{"id": 1,"assessmentId": 1001,"fileType": 1,"fileName": "自评表.jpg","fileSize": 1024000,"uploadedAt": "2026-03-06T10:35:00"}
### 3.2 上传并解析自评表 OCR
- 接口名称：解析自评表
- URL：/files/{assessmentId}/self-assessment/parse
- 方法：POST
- 功能说明：上传自评表并自动OCR解析，返回结构化数据
  路径参数：
  |参数名|类型|必填|说明|示例|
  |assessmentId|Integer|是|评估记录ID|1001|

            参数名
            类型
            必填
            说明
            示例
            assessmentId
            Integer
            是
            评估记录ID
            1001
请求格式：multipart/form-data
|参数名|类型|必填|说明|示例|
|file|File|是|自评表图片|JPG/PNG|

            参数名
            类型
            必填
            说明
            示例
            file
            File
            是
            自评表图片
            JPG/PNG
返回示例：
json
{"file": {"id": 1,"fileName": "自评表.jpg"},"selfAssessment": {"eat": 2,"wash": 1,"dress": 1,"toilet": 2,"move": 1,"memory": 3,"orientation": 3,"emotion": 2,"social": 2,"vision": 3,"language": 3,"selfGrade": "E级"}}
### 3.3 上传医疗资料并返回OCR解析结果
- 接口名称：上传医疗资料
- URL：/files/{assessmentId}/medical
- 方法：POST
- 功能说明：上传病历、诊断书等
  路径参数：
  |参数名|类型|必填|说明|示例|
  |assessmentId|Integer|是|评估记录ID|1001|

            参数名
            类型
            必填
            说明
            示例
            assessmentId
            Integer
            是
            评估记录ID
            1001
请求格式：multipart/form-data
|参数名|类型|必填|说明|示例|
|file|File|是|医疗资料文件|图片/PDF|

            参数名
            类型
            必填
            说明
            示例
            file
            File
            是
            医疗资料文件
            图片/PDF
返回示例：
{    "file": {        "id": 17,        "assessmentId": 1,        "fileType": 2,        "fileName": "25123111201131619811(1).jpg",        "filePath": ".\\uploads\\c27a83ed-fd7f-45ca-b738-fd34be13db0a.jpg",        "fileSize": 1211868,        "uploadedAt": "2026-03-09T10:36:03.156"    },    "ocrText": "# 常州市第七人民医院\n\n# 苏州大学附属常州老年病医院\n\n姓名\n\n<div style=\"text-align: center;\"><img src=\"imgs/img_in_image_box_298_393_441_462.jpg\" alt=\"Image\" width=\"5%\" /></div>\n\n\n# 出院记录\n\n科别 消化内科 病区 十四病区\n\n肝功能未见异常。胸部+腹部CT平扫：胸部平扫两肺未见明显异常，心影增大。左肾囊肿。心电图：房颤伴快速心室率，部分ST-T改变。经治疗后患者症状好转，复查血细胞分析B+HSCRP:白细胞7.18*109/L，血红蛋白100.0g/L，超敏C反应蛋白16.5mg/L，肾功能：尿素氮6.53mmol/L，肌酐172.0umol/L，尿酸539umol/L。现患者病情平稳，予以出院。\n\n伤口愈合：——\n\n患者无腹痛、腹胀，无腹泻，无呕血、黑便、血便，无恶心、呕吐，无畏寒、发热，无胸闷、气急，食纳、睡眠可，大小便无异常。查体：神清，精神可，两肺呼吸音清，未闻及明显干湿性罗音，心律齐，无杂音。腹部平软，无压痛、反跳痛，未触及包块，肝脾肋下未及，移动性浊音阴性，肠鸣音无亢进。\n\n出院医嘱：\n\n一、出院带药：无\n\n二、休息期限：建休1周。\n\n三、复诊时间：预约2022年11月20日。\n\n四、健康宣教·避免剧烈活动，防劳累、受凉感冒，如有不适及时就诊。\n\n五、注意事项：清淡饮食，优质蛋白饮食；肾内科门诊随诊，复查肾功能；定期复查腹部B超；必要时完善MRCP检查，消化内科门诊随诊。\n\n六、备注：如患方需要复印卫生行政部门规定的病历资料，建议出院一周后，工作日，至一楼门诊大厅一站式服务中心申请办理。\n\n\n\n<div style=\"text-align: center;\"><img src=\"imgs/img_in_seal_box_1305_1532_1750_1962.jpg\" alt=\"Image\" width=\"18%\" /></div>\n\n\n1. 申请人为患者本人的，提供其有效身份证明；\n\n2. 申请人非患者本人，为家属或代理人的，应当提供患者和家属（或代理人）双方有效身份证明，以及代理人与患者关系的法定证明材料和授权委托书。\n\n七、家属或患者本人接收出院记录或相关资料，签名：\n\nX光片号：___\n\nCT号：___\n\nMRI号：___\n\n主任医师：李莉\n\n病理号：___\n\n医生签名：李娟平",    "ocrLength": 1031}
### 3.4 上传音视频材料
- 接口名称：上传音视频
- URL：/files/{assessmentId}/video
- 方法：POST
- 功能说明：上传音视频文件
  路径参数：
  |参数名|类型|必填|说明|示例|
  |assessmentId|Integer|是|评估记录ID|1001|

            参数名
            类型
            必填
            说明
            示例
            assessmentId
            Integer
            是
            评估记录ID
            1001
请求格式：multipart/form-data
|参数名|类型|必填|说明|示例|
|file|File|是|音视频文件|MP4/MP3|

            参数名
            类型
            必填
            说明
            示例
            file
            File
            是
            音视频文件
            MP4/MP3
### 3.6 删除文件
- 接口名称：删除文件
- URL：/files/{fileId}
- 方法：DELETE
- 功能说明：删除指定文件
  路径参数：
  |参数名|类型|必填|说明|示例|
  |fileId|Integer|是|文件ID|1|

            参数名
            类型
            必填
            说明
            示例
            fileId
            Integer
            是
            文件ID
            1
# AI智能评估接口
### 4.1 生成AI评估建议
- 接口名称：生成AI建议
- URL：/ai/suggestion/{assessmentId}
- 方法：POST
- 功能说明：上传文件生成专业的失能评估报告，结果会自动入库
- 路径参数：assessmentId(Integer, 必填)
- 请求格式：multipart/form-data
  |参数名|类型|必填|说明|
  |selfAssessment|File|是|自评表文件（图片）|
  |medical|File|是|病历资料文件（图片/PDF）|
  |audioVideo|File|否|音视频文件|

            参数名
            类型
            必填
            说明
            selfAssessment
            File
            是
            自评表文件（图片）
            medical
            File
            是
            病历资料文件（图片/PDF）
            audioVideo
            File
            否
            音视频文件
返回示例：
{    "code": 200,    "data": {        "success": true,        "suggestion": "{\n  \"智能评估结果摘要\": {\n    \"ADL雷达\": [\n      {\n        \"项目\": \"进食\",\n        \"评估\": \"部分独立\",\n        \"依据\": \"自评表选择‘部分独立’（选项1），病历记载‘食纳可’，无吞咽困难或需喂食描述，结合帕金森病及肌张力障碍可能导致手部精细动作不稳，推断需辅助夹菜或盛饭，但能自己持餐具进食。\"\n      },\n      {\n        \"项目\": \"穿衣\",\n        \"评估\": \"依赖\",\n        \"依据\": \"自评表选择‘依赖’（选项0），结合诊断‘肌张力障碍’‘帕金森病’及‘头面部不自主运动’，可能导致上肢协调性差、扣衣困难，符合穿衣依赖标准。\"\n      },\n      {\n        \"项目\": \"面部与口腔清洁\",\n        \"评估\": \"未知\",\n        \"依据\": \"病历及自评表均未提及洗脸、刷牙、剃须等能力，无直接证据支持评估，数据不足。\"\n      },\n      {\n        \"项目\": \"大便控制\",\n        \"评估\": \"独立\",\n        \"依据\": \"病历明确记载‘二便如常’，无失禁、导尿、灌肠等描述，结合自评表虽选‘依赖’（选项01）但无医疗证据支持，以病历为准判定为独立。\"\n      },\n      {\n        \"项目\": \"小便控制\",\n        \"评估\": \"独立\",\n        \"依据\": \"病历明确记载‘二便如常’，尿检异常（白细胞酯酶2+、细菌↑）提示尿路感染，但无尿失禁或导尿管描述，控制能力未受损，判定独立。\"\n      },\n      {\n        \"项目\": \"用厕\",\n        \"评估\": \"部分独立\",\n        \"依据\": \"自评表选择‘部分独立’（选项1），病历无直接描述，但‘二便如常’提示基本功能存在，结合肌张力障碍可能导致起身、整理衣裤困难，推断需帮助完成部分动作。\"\n      },\n      {\n        \"项目\": \"平地行走\",\n        \"评估\": \"独立\",\n        \"依据\": \"病历查体‘四肢肌力V级，腱反射正常，无肢体活动障碍’，且无卧床、轮椅或医生限制活动描述，推断可用辅具独立行走5米。\"\n      },\n      {\n        \"项目\": \"床椅转移\",\n        \"评估\": \"部分独立\",\n        \"依据\": \"自评表选择‘部分独立’（选项1），病历无直接描述，但肌力正常且无卧床，结合帕金森病可能导致起身不稳，推断需1人搀扶或监护。\"\n      },\n      {\n        \"项目\": \"上下楼\",\n        \"评估\": \"未知\",\n        \"依据\": \"病历及自评表均未提及上下楼能力，无直接证据，数据不足。\"\n      },\n      {\n        \"项目\": \"洗澡\",\n        \"评估\": \"依赖\",\n        \"依据\": \"自评表选择‘依赖’（选项0），结合‘头面部不自主运动’及帕金森病可能导致平衡不稳、手部失控，洗澡高风险，推断需他人帮助。\"\n      }\n    ],\n    \"智能评估失能等级建议\": {\n      \"区间\": \"中度失能-重度失能Ⅰ级\",\n      \"依据\": \"ADL已知项评分：进食5+穿衣0+大便10+小便10+用厕5+平地行走15+床椅转移10+洗澡0=55分（中度受损）。未知项（面部清洁、上下楼）若均为0分，总分≤45分则为重度受损。认知方面，病历有‘脑萎缩’‘多发性腔隙性脑梗死’，属高风险因素，至少轻度受损。组合规则：ADL中度受损+认知轻度受损→中度失能；ADL重度受损+认知轻度受损→重度失能Ⅰ级。\"\n    },\n    \"置信度提示\": {\n      \"置信度\": \"中\",\n      \"置信度依据\": \"ADL部分项目（穿衣、洗澡、用厕、床椅转移）依赖医疗推断或自评，缺乏直接行为描述；认知无直接评估，仅基于影像学推断；未知项（面部清洁、上下楼）可能影响总分。病历时效性为2021年，距今较久，病情可能变化。\"\n    }\n  },\n  \"系统预评估提示\": {\n    \"主要致失能推断原因\": [\n      {\n        \"原因\": \"帕金森病合并肌张力障碍\",\n        \"依据\": \"病历明确诊断‘既往有帕金森病’‘出院诊断肌张力障碍’，导致头面部不自主运动、肢体协调性下降，直接影响穿衣、洗澡、转移等ADL项目（推断）。\"\n      },\n      {\n        \"原因\": \"脑萎缩及多发性腔隙性脑梗死\",\n        \"依据\": \"CT检查显示‘脑萎缩’‘多发性腔隙性脑梗死’，属认知功能高风险因素，可能影响定向力、记忆力，间接加重失能（推断）。\"\n      },\n      {\n        \"原因\": \"尿路感染及电解质紊乱\",\n        \"依据\": \"检验报告示尿白细胞酯酶2+、细菌↑，钾3.43mmol/L↓，可能引起乏力、意识模糊，短期加重活动能力或认知负担（推断）。\"\n      }\n    ],\n    \"重点评估关注事项\": [\n      {\n        \"事项\": \"自评与病历矛盾：大小便控制自评依赖但病历记载‘二便如常’\",\n        \"依据\": \"自评表大小便控制选‘依赖’，但病历无失禁或导尿证据，需现场核实是否因尿路感染临时依赖或自评夸大。\"\n      },\n      {\n        \"事项\": \"认知能力未评估，但存在脑萎缩和脑梗死高风险\",\n        \"依据\": \"病历有‘脑萎缩’‘多发性腔隙性脑梗死’，必须现场评估时间/人物/空间定向及记忆力，避免低估失能等级。\"\n      },\n      {\n        \"事项\": \"穿衣和洗澡依赖程度需验证\",\n        \"依据\": \"自评表穿衣、洗澡均选‘依赖’，但病历无直接描述，需观察手部精细动作（如扣扣子）和洗澡时平衡能力。\"\n      }\n    ],\n    \"高风险标记\": [\n      {\n        \"标记\": \"帕金森病\",\n        \"依据\": \"病历明确记载‘既往有帕金森病’，属神经系统退行性疾病，易导致进行性运动功能障碍。\"\n      },\n      {\n        \"标记\": \"脑萎缩\",\n        \"依据\": \"CT报告‘脑萎缩’，直接提示认知功能潜在损害风险。\"\n      },\n      {\n        \"标记\": \"多发性腔隙性脑梗死\",\n        \"依据\": \"CT报告‘多发性腔隙性脑梗死’，增加认知障碍和运动协调障碍风险。\"\n      }\n    ]\n  },\n  \"重点建议\": {\n    \"个性化重点提问清单\": [\n      {\n        \"问题\": \"您平时吃饭时，是自己拿筷子勺子，还是需要别人帮忙夹菜或切食物？有没有呛咳？\",\n        \"来源\": \"自评异常\",\n        \"依据\": \"自评进食选‘部分独立’，需确认是否因手抖需辅助，排除吞咽困难。\"\n      },\n      {\n        \"问题\": \"您穿衣服时，扣纽扣、拉拉链、系鞋带这些动作能自己完成吗？还是完全要别人帮忙？\",\n        \"来源\": \"病历高风险\",\n        \"依据\": \"帕金森病和肌张力障碍易致精细动作障碍，自评选‘依赖’，需具体化困难点。\"\n      },\n      {\n        \"问题\": \"您最近大小便有没有失禁？晚上起夜几次？有没有用尿不湿或导尿管？\",\n        \"来源\": \"自评异常\",\n        \"依据\": \"自评大小便选‘依赖’但病历写‘二便如常’，需澄清是否因尿路感染临时失控。\"\n      },\n      {\n        \"问题\": \"您记不记得今天是几月几号？能不能说出三个子女的名字？出门会不会迷路？\",\n        \"来源\": \"病历高风险\",\n        \"依据\": \"脑萎缩和脑梗死提示认知风险，需评估时间/人物/空间定向。\"\n      },\n      {\n        \"问题\": \"您从床上坐起来再站到地上，需要扶着东西或别人搀扶吗？洗澡时会不会站不稳？\",\n        \"来源\": \"量表高影响项\",\n        \"依据\": \"床椅转移自评‘部分独立’、洗澡自评‘依赖’，需核实平衡能力和防跌倒需求。\"\n      }\n    ],\n    \"建议重点核实的能力项\": [\n      {\n        \"能力项\": \"穿衣\",\n        \"依据\": \"自评依赖但病历无直接描述，帕金森病典型症状为精细动作障碍，需现场测试扣纽扣等动作。\"\n      },\n      {\n        \"能力项\": \"认知能力\",\n        \"依据\": \"脑萎缩和脑梗死为高风险因素，必须评估定向力、记忆力，避免等级低估。\"\n      },\n      {\n        \"能力项\": \"大小便控制\",\n        \"依据\": \"自评与病历矛盾，需确认是否因尿路感染导致临时失禁或使用辅助器具。\"\n      }\n    ],\n    \"建议现场/视频重点观察动作\": [\n      {\n        \"观察动作\": \"观察患者用勺子进食时手部震颤或不自主运动情况\",\n        \"依据\": \"病历记载‘头面部不自主运动’，需判断是否影响餐具使用。\"\n      },\n      {\n        \"观察动作\": \"观察从坐姿站起时是否需扶物或他人搀扶，步态是否平稳\",\n        \"依据\": \"床椅转移自评部分独立，帕金森病易致起身困难，需评估实际转移能力。\"\n      },\n      {\n        \"观察动作\": \"观察扣纽扣或拉拉链的精细动作完成度\",\n        \"依据\": \"穿衣自评依赖，帕金森病典型症状，直接关联评分。\"\n      }\n    ]\n  }\n}",        "finishReason": null,        "promptTokens": 12604,        "completionTokens": 2301,        "totalTokens": 14905,        "errorMessage": null,        "createTime": "2026-03-09T14:37:22.143"    },    "message": "success"
# 所有查询接口完整文档
## 一、被保险人查询接口
### 1.1 查询所有被保险人
- 接口：GET /api/insured-persons
- 说明：获取全部被保险人列表
  请求示例：
  text
  GET http://localhost:8080/api/insured-persons
  返回字段说明：
  |字段名|类型|说明|
  |id|Integer|主键ID|
  |name|String|被保险人姓名|
  |idCard|String|身份证号|
  |phone|String|联系电话|
  |insuranceArea|String|参保地|
  |assessor|String|评估人员|
  |createdAt|String|创建时间|
  |updatedAt|String|更新时间|

            字段名
            类型
            说明
            id
            Integer
            主键ID
            name
            String
            被保险人姓名
            idCard
            String
            身份证号
            phone
            String
            联系电话
            insuranceArea
            String
            参保地
            assessor
            String
            评估人员
            createdAt
            String
            创建时间
            updatedAt
            String
            更新时间
返回示例：
json
[  {    "id": 1,    "name": "张三",    "idCard": "110101199001011234",    "phone": "13800138000",    "insuranceArea": "北京市朝阳区",    "assessor": "李医生",    "createdAt": "2024-01-01T10:30:00",    "updatedAt": "2024-01-01T10:30:00"  }]
### 1.3 根据身份证号查询
- 接口：GET /api/insured-persons/idcard/{idCard}
- 说明：通过身份证号精确查询
  路径参数：
  |参数名|类型|必填|说明|
  |idCard|String|是|身份证号|

            参数名
            类型
            必填
            说明
            idCard
            String
            是
            身份证号
请求示例：
text
GET http://localhost:8080/api/insured-persons/idcard/110101199001011234
返回示例：同 1.1 的单条数据
### 1.4 按姓名模糊搜索
- 接口：GET /api/insured-persons/search
- 说明：根据姓名关键词搜索
  请求参数：
  |参数名|类型|必填|说明|
  |name|String|是|姓名关键词|

            参数名
            类型
            必填
            说明
            name
            String
            是
            姓名关键词
请求示例：
text
GET http://localhost:8080/api/insured-persons/search?name=张
返回示例：同 1.1 的数组格式
## 二、评估记录查询接口
### 2.1 获取评估详情
- 接口：GET /api/assessments/{assessmentId}/detail
- 说明：获取评估主表 + 所有评估项目
  路径参数：
  |参数名|类型|必填|说明|
  |assessmentId|Integer|是|评估记录ID|

            参数名
            类型
            必填
            说明
            assessmentId
            Integer
            是
            评估记录ID
请求示例：
text
GET http://localhost:8080/api/assessments/1001/detail
返回字段说明 - assessment 对象：
|字段名|类型|说明|
|id|Integer|评估记录ID|
|insuredPersonId|Integer|被保险人ID|
|idCard|String|身份证号|
|name|String|被保险人姓名|
|assessmentDate|String|评估日期|
|assessor|String|评估人员|
|finalGrade|String|失能等级|
|finalScore|Float|综合得分|
|status|Integer|0-草稿 1-已提交 2-已确认|
|submitTime|String|提交时间|
|itemCount|Integer|评估项数|
|createdAt|String|创建时间|
|updatedAt|String|更新时间|

            字段名
            类型
            说明
            id
            Integer
            评估记录ID
            insuredPersonId
            Integer
            被保险人ID
            idCard
            String
            身份证号
            name
            String
            被保险人姓名
            assessmentDate
            String
            评估日期
            assessor
            String
            评估人员
            finalGrade
            String
            失能等级
            finalScore
            Float
            综合得分
            status
            Integer
            0-草稿 1-已提交 2-已确认
            submitTime
            String
            提交时间
            itemCount
            Integer
            评估项数
            createdAt
            String
            创建时间
            updatedAt
            String
            更新时间
返回字段说明 - items 数组：
|字段名|类型|说明|
|id|Integer|项目ID|
|assessmentId|Integer|评估记录ID|
|category|Integer|1-日常生活 2-认知 3-情绪 4-感知觉|
|itemCode|String|项目代码|
|itemName|String|项目名称|
|grade|Integer|评定等级 0/1/2/3|
|selfGrade|Integer|自评等级|
|assessmentNote|String|评估意见|

            字段名
            类型
            说明
            id
            Integer
            项目ID
            assessmentId
            Integer
            评估记录ID
            category
            Integer
            1-日常生活 2-认知 3-情绪 4-感知觉
            itemCode
            String
            项目代码
            itemName
            String
            项目名称
            grade
            Integer
            评定等级 0/1/2/3
            selfGrade
            Integer
            自评等级
            assessmentNote
            String
            评估意见
返回示例：
json
{  "assessment": {    "id": 1001,    "insuredPersonId": 1,    "idCard": "110101199001011234",    "name": "张三",    "assessmentDate": "2024-05-21",    "assessor": "李医生",    "finalGrade": "重度失能",    "finalScore": 2.3,    "status": 1,    "submitTime": "2024-05-21T15:30:00",    "itemCount": 11,    "createdAt": "2024-05-21T10:00:00",    "updatedAt": "2024-05-21T15:30:00"  },  "items": [    {      "id": 1,      "assessmentId": 1001,      "category": 1,      "itemCode": "eat",      "itemName": "进食",      "grade": 2,      "selfGrade": 2,      "assessmentNote": "能独立使用餐具"    }    // ... 其余10项  ]}
## 文件查询接口
### 3.1 获取评估的所有文件
- 接口：GET /api/files/{assessmentId}
- 说明：查看某次评估上传的所有文件
  路径参数：
  |参数名|类型|必填|说明|
  |assessmentId|Integer|是|评估记录ID|

            参数名
            类型
            必填
            说明
            assessmentId
            Integer
            是
            评估记录ID
返回字段说明：
|字段名|类型|说明|
|id|Integer|文件ID|
|assessmentId|Integer|评估记录ID|
|fileType|Integer|1-自评表 2-医疗 3-音视频|
|fileName|String|原文件名|
|filePath|String|存储路径|
|fileSize|Integer|文件大小（字节）|
|uploadedAt|String|上传时间|

            字段名
            类型
            说明
            id
            Integer
            文件ID
            assessmentId
            Integer
            评估记录ID
            fileType
            Integer
            1-自评表 2-医疗 3-音视频
            fileName
            String
            原文件名
            filePath
            String
            存储路径
            fileSize
            Integer
            文件大小（字节）
            uploadedAt
            String
            上传时间
请求示例：
text
GET http://localhost:8080/api/files/1001
返回示例：
json
[  {    "id": 1,    "assessmentId": 1001,    "fileType": 1,    "fileName": "自评表.jpg",    "filePath": "./uploads/xxx.jpg",    "fileSize": 1024000,    "uploadedAt": "2024-05-21T10:30:00"  },  {    "id": 2,    "assessmentId": 1001,    "fileType": 2,    "fileName": "病历.pdf",    "filePath": "./uploads/xxx.pdf",    "fileSize": 2048000,    "uploadedAt": "2024-05-21T10:31:00"  }]
## AI建议查询接口
### 4.1 查询已生成的AI建议
- 接口：GET /api/ai/suggestion/{assessmentId}
- 说明：根据评估ID查询已生成的AI建议
  路径参数：
  |参数名|类型|必填|说明|
  |assessmentId|Integer|是|评估记录ID|

            参数名
            类型
            必填
            说明
            assessmentId
            Integer
            是
            评估记录ID
请求示例：
text
GET http://localhost:8080/api/ai/suggestion/1001
返回字段说明：
|字段名|类型|说明|
|code|Integer|状态码|
|message|String|状态信息|
|data.success|Boolean|是否成功|
|data.suggestion|String|AI建议内容（JSON字符串）|
|data.promptTokens|Integer|输入token数|
|data.completionTokens|Integer|输出token数|
|data.totalTokens|Integer|总token数|

            字段名
            类型
            说明
            code
            Integer
            状态码
            message
            String
            状态信息
            data.success
            Boolean
            是否成功
            data.suggestion
            String
            AI建议内容（JSON字符串）
            data.promptTokens
            Integer
            输入token数
            data.completionTokens
            Integer
            输出token数
            data.totalTokens
            Integer
            总token数
返回示例：
json
{  "code": 200,  "message": "success",  "data": {    "success": true,    "suggestion": "{\"智能评估结果摘要\":{...},\"系统预评估提示\":{...},\"重点建议\":{...}}",    "promptTokens": 12603,    "completionTokens": 2513,    "totalTokens": 15116  }}
> 来自: ltci
