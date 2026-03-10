# 
基础URL：http://localhost:8080/api
数据格式：所有请求和响应均为 JSON 格式（文件上传除外）
一、被保险人管理接口
创建被保险人
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
```plaintext
{
"name": "张三",
"idCard": "110101199001011234",
"phone": "13800138000",
"insuranceArea": "北京市朝阳区",
"assessor": "李医生"
}
```
返回示例：
```plaintext
{
"id": 1,
"name": "张三",
"idCard": "110101199001011234",
"phone": "13800138000",
"insuranceArea": "北京市朝阳区",
"assessor": "李医生",
"createdAt": "2026-03-06T10:30:00",
"updatedAt": "2026-03-06T10:30:00"
}
```
二、评估管理接口
2.1 创建评估草稿
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
请求示例：
```plaintext
{
"insuredPersonId": 1,
"idCard": "110101199001011234",
"assessmentDate": "2026-03-06",
"assessor": "李医生"
}
```
返回示例：
```plaintext
{
"id": 1001,
"insuredPersonId": 1,
"idCard": "110101199001011234",
"assessmentDate": "2026-03-06",
"assessor": "李医生",
"status": 0,
"createdAt": "2026-03-06T10:30:00"
}
```
2.2 提交评估结果
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
```plaintext
{
"items": [
{
"category": 1,
"itemCode": "eat",
"itemName": "进食",
"grade": 2,
"selfGrade": 2,
"assessmentNote": "能独立使用餐具"
},
{
"category": 1,
"itemCode": "wash",
"itemName": "洗漱",
"grade": 1,
"assessmentNote": "需部分协助"
}
// ... 共11项
]
}
```
返回示例：
json
```plaintext
{
"id": 1001,
"insuredPersonId": 1,
"idCard": "110101199001011234",
"assessmentDate": "2026-03-06",
"assessor": "李医生",
"finalGrade": "重度失能",
"finalScore": 2.3,
"itemCount": 11,
"status": 1,
"submitTime": "2026-03-06T11:30:00"
}
```
三、文件上传接口
3.1 上传自评表
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
```plaintext
{
"id": 1,
"assessmentId": 1001,
"fileType": 1,
"fileName": "自评表.jpg",
"fileSize": 1024000,
"uploadedAt": "2026-03-06T10:35:00"
}
```
3.2 上传并解析自评表 OCR
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
```plaintext
{
"file": {
"id": 1,
"fileName": "自评表.jpg"
},
"selfAssessment": {
"eat": 2,
"wash": 1,
"dress": 1,
"toilet": 2,
"move": 1,
"memory": 3,
"orientation": 3,
"emotion": 2,
"social": 2,
"vision": 3,
"language": 3,
"selfGrade": "E级"
}
}
```
3.3 上传医疗资料
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
3.4 上传音视频材料
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
3.6 删除文件
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
来自: ltci
