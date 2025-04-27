1. Node Types

1.1 Setup Management

The node types related to the global application data.

1.1.1 StakeholderCategory
Properties:
- lastChangedAt: the last change time stamp used to manage concurrent edition
- lastChangedBy: the last change author used to manage concurrent edition
- name
- description

1.1.2 Data
Properties:
- lastChangedAt: the last change time stamp used to manage concurrent edition
- lastChangedBy: the last change author used to manage concurrent edition
- name
- description

1.1.3 Service
Properties:
- lastChangedAt: the last change time stamp used to manage concurrent edition
- lastChangedBy: the last change author used to manage concurrent edition
- name
- description

1.1.4 RegulatoryAspect
Properties:
- lastChangedAt: the last change time stamp used to manage concurrent edition
- lastChangedBy: the last change author used to manage concurrent edition
- name
- description

1.1.5 Wave
Properties:
- year - YYYY
- quarter - a digit between 1 and 4
- date - YYYY/MM/DD
- name - derived = year.quarter

1.2 Folder Management

The node types related to the organisation of the operational needs and requirements.

1.2.1 Folder
Properties:
- lastChangedAt: the last change time stamp used to manage concurrent edition
- lastChangedBy: the last change author used to manage concurrent edition
- name
- description

1.3 Operational Needs Management

The node types required to the management of operational needs.

1.3.1 OperationalNeed
Properties:
- lastChangedAt: the last change time stamp used to manage concurrent edition
- lastChangedBy: the last change author used to manage concurrent edition
- shortName - a short ON identifier

1.3.2 OperationalNeedVersion
Properties:
- lastChangedAt: the last change time stamp used to manage concurrent edition
- lastChangedBy: the last change author used to manage concurrent edition
- version - an integer that represents the public version of the ON - this number is set at OperationalNeedVersion creation time, then frozen
- published - a boolean that is set to true when the ON version is published for first time - at this point, only minor change, e.g. typo corrections can be done on this version
- description - a rich text

1.3 Operational Requirements Management

The node types required to the management of operational requirements.

1.3.1 OperationalRequirement
Properties:
- lastChangedAt: the last change time stamp used to manage concurrent edition
- lastChangedBy: the last change author used to manage concurrent edition
- shortName - a short OR identifier

1.3.2 OperationalRequirementVersion
Properties:
- lastChangedAt: the last change time stamp used to manage concurrent edition
- lastChangedBy: the last change author used to manage concurrent edition
- version - an integer that represents the public version of the OR - this number is set at OperationalRequirementVersion creation time, then frozen
- published - a boolean that is set to true when the ON version is published for first time - at this point, only minor change, e.g. typo corrections can be done on this version
- description - a rich text

1.4 Operational Changes Management

The node types required to the management of operational changes.

1.4.1 OperationalChange
Properties:
- lastChangedAt: the last change time stamp used to manage concurrent edition
- lastChangedBy: the last change author used to manage concurrent edition
- shortName - a short OC identifier
- description

1.4.2 OperationalChangeMilestone
Properties:
- lastChangedAt: the last change time stamp used to manage concurrent edition
- lastChangedBy: the last change author used to manage concurrent edition
- shortName
- description
- relativeDate - a number of quarter (positive or negative) relative to the operational change target wave date

1.5 Operational Deployment Plan Management

The node types required to the management of operational plan editions.

1.5.1 OperationalDeploymentPlanEdition
Properties:
- lastChangedAt: the last change time stamp used to manage concurrent edition
- lastChangedBy: the last change author used to manage concurrent edition
- editionYear: YYYY
- editionIndex: #
- targetDate
- publicationDate

1.6 Digital Asset Management

The node types required to the management of digital assets.

1.6.1 Document
Properties:
- name - filename
- description - optional description
- mimeType - content type (PDF, DOCX, etc.)
- size - file size in bytes
- uploadedAt - timestamp
- uploadedBy
- path - storage path or identifier

1.7 User Management

The node types required to the management of users.

1.7.1 User
- email
- firstName
- lastName

1.8 Review Management

The node types required to the management of user reviews.

1.8.1 Comment
- postedAt: the time stamp of the comment post
- postedBy: the author of the comment
- text: the text of the comment


2 Relation Types

2.1 HAS_DOCUMENT
- source - any node but Document
- target - a Document

2.2 HAS_PARENT
- source - Folder, Service, Data, StakeholderCategory
- target - a node of same type as the source

2.3 BELONGS_TO
- source - OperationalNeed or OperationalRequirement
- target - Folder

2.4 IMPACTS
- source - OperationalNeedVersion, OperationalRequirementVersion, OperationalChange, or OperationalChangeMilestone
- target - Service, RegulatoryAspect, StakeholderCategory, or Data

2.5 HAS_VERSION
- source - OperationalNeed or OperationalRequirement
- target - OperationalNeedVersion or OperationalRequirementVersion

2.6 IMPLEMENTS
- source - OperationalRequirementVersion
- target - OperationalNeedVersion

2.7 CHANGES_FROM
- source - OperationalChange
- target - OperationalRequirementVersion

2.8 CHANGES_TO
- source - OperationalChange
- target - OperationalRequirementVersion

2.9 HAS_MILESTONE
- source - OperationalChange
- target - OperationalChangeMilestone

2.10 DELIVERS
- source - Wave
- target - OperationalChangeMilestone

2.11 DEPLOYS
- source - Wave
- target - OperationalChange

2.12 PLANS
- source - OperationalDeploymentPlanEdition
- target - OperationalChange

2.13 HAS_COMMENT
- source - OperationalNeedVersion, OperationalRequirementVersion, OperationalChange, OperationalChangeMilestone, or OperationalDeploymentPlanEdition
- target - Comment

2.14 DEPENDS_ON
- source - OperationalRequirementVersion
- target - OperationalRequirementVersion
