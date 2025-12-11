# 공공디자인 `parent_id` 컬럼 및 데이터 페어링 가이드

공공디자인 리스트(`design_contents_type = 'list'`)와 디테일(`design_contents_type = 'detail'`)을 `display_order`만으로 묶다 보면 유일한 매칭이 깨지는 경우가 있어서, `parent_id`로 직접 연결하도록 구조를 바꾸고 있습니다. 이 문서는 다음과 같은 흐름을 안내합니다.

1. `public_design_contents`에 `parent_id` 컬럼을 추가한다.
2. 각 디테일 항목에 해당하는 리스트 항목의 `id`를 채워 넣는다.
3. API/프론트엔드가 `parent_id`를 우선으로 사용하도록 작동한다(이미 구현됨).

## 1. 스키마 변경

이미 `sqls/schema.sql`에 아래 SQL이 반영되어 있지만 실제 Supabase 인스턴스에도 동일한 명령을 실행해야 합니다.

```sql
alter table public.public_design_contents
  add column parent_id uuid;

alter table public.public_design_contents
  add constraint public_design_contents_parent_id_fkey
  foreign key (parent_id) references public.public_design_contents(id);
```

이 컬럼은 리스트(row)의 `id`를 참조하며, 리스트 항목은 `NULL`로 유지합니다. 디테일 항목을 생성/수정할 때 해당 리스트의 `id`를 `parent_id`에 설정해야 합니다.

## 2. 기존 데이터 페어링

1. `detail` 항목 중 `parent_id`가 없는 레코드를 목록화합니다.

```sql
select
  d.id as detail_id,
  d.project_category,
  d.display_order,
  d.title as detail_title,
  l.id as candidate_list_id,
  l.title as list_title,
  l.location as list_location
from public_design_contents d
left join public_design_contents l on
  l.design_contents_type = 'list'
  and l.project_category = d.project_category
  and l.display_order = d.display_order
where d.design_contents_type = 'detail'
  and d.parent_id is null
order by d.project_category, d.display_order;
```

2. 출력 결과를 보고 `detail_id`와 매칭 가능한 리스트(`candidate_list_id`)가 맞는지 `list_title`/`list_location`과 `detail_title`을 비교하여 검증합니다. 앞서 콘솔에서 본 사례(`display_order = 22`)처럼 리스트/디테일이 엇갈려 있다면 `display_order`가 아니라 실제 프로젝트 제목·위치로 판별한 뒤 `parent_id`를 수동으로 채워야 합니다.

3. 매칭이 확인되면 다음 SQL로 `parent_id`를 채웁니다.

```sql
update public_design_contents
set parent_id = '<list-id>'
where id = '<detail-id>';
```

예: `detail_id = 434263a0-4e9e-46e4-8f1b-b4cca85def0b`를 `list_id = 08ee08d2-247c-4c42-bcd4-c23c217fd0d2`에 연결하는 경우 위 SQL에 리스트 id/detail id를 넣으면 됩니다.

4. 필터 없이 `parent_id`만 있는지 확인하기 위해 다음과 같이 검증할 수 있습니다.

```sql
select id, project_category, display_order, parent_id
from public_design_contents
where design_contents_type = 'detail'
  and parent_id is null;
```

모두 채워졌다면 디테일 API가 `parent_id`를 기준으로 동작해서 리스트와 정확히 맞는 콘텐츠만 내려주게 됩니다.

## 3. 확인

1. `/api/public-design-projects/<category>/<display_order>`를 호출해 `detailContents`에 `parent_id`가 채워졌는지 확인합니다. API는 처음에 `parent_id` 필터를 시도하고, 매칭이 없을 때만 `display_order`로 fallback하므로 `parent_id`가 채워진 상태에서는 예기치 않은 항목이 내려오지 않습니다.
2. 프론트엔드에서 케이스별로 디테일 페이지를 열어보면서 `list`와 이미지가 일치하는지 확인합니다.

필요 시 관리자 화면이나 CSV 등을 이용해 `parent_id`를 대량으로 채우는 스크립트를 만들어도 되지만, 우선은 위 SQL로 일치 여부를 확인하고 수동/자동으로 `parent_id`를 채우면 됩니다.


