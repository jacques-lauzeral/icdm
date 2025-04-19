1. Graph DB Model

1.1 Node Types

1.1.1 Document
Properties:
- name - filename
- description - optional description
- mimetype - content type (PDF, DOCX, etc.)
- size - file size in bytes
- uploaded_at - timestamp
- path - storage path or identifier

1.1.2 Stakeholder
Properties:
- name
- description

1.1.3 Data
Properties:
- name
- description

1.1.4 Service
Properties:
- name
- description

1.1.5 Regulatory Aspect
Properties:
- name
- description

1.1.6 Wave
Properties:
- year - YYYY
- quarter - #
- date - YYYY/MM/DD
- name - derived = year.quarter

1.1.7 Folder
Properties:
- name
- description

1.1.8 OperationalNeed
Properties:
- name
- description
- version
- last-updated-at
- last-updated-by

1.1.9 OperationalRequirement
Properties:
- name
- description
- version
- last-updated-at
- last-updated-by

1.1.10 OperationalChange
Properties:
- name
- description
- last-updated-at
- last-updated-by

1.1.11 OperationalChangeMilestone
Properties:
- name
- description
- relative-quarter

1.1.12 ODPEdition
Properties:
- edition-year: YYYY
- edition-index: #
- target-date
- publication-date

1.1.13 Author
- first-name
- last-name

1.1.14 Comment
- text

1.1.15 NodeChangeEvent
- timestamp
- meta-type: NODE or EDGE
- entity-type
- entity-id
- changes

1.2 Relation Types

1.2.1 HAS_DOCUMENT
