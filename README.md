# Frontend
핏핏 프로젝트 프론트엔드

## Commit Rules

커밋 메시지는 아래의 규칙에 따라 작성합니다.

- **feat** : 새로운 기능 추가
- **fix** : 버그 수정
- **docs** : 문서 수정
- **style** : 코드 스타일 변경 (코드 포매팅, 세미콜론 누락 등), 기능 수정이 없는 경우
- **design** : 사용자 UI 디자인 변경 (CSS 등)
- **test** : 테스트 코드, 리팩토링 테스트 코드 추가
- **refactor** : 코드 리팩토링
- **build** : 빌드 파일 수정
- **ci** : CI 설정 파일 수정
- **perf** : 성능 개선
- **chore** : 빌드 업무 수정, 패키지 매니저 수정 (gitignore 수정 등)
- **rename** : 파일 혹은 폴더명을 수정만 한 경우
- **remove** : 파일을 삭제만 한 경우
- **Update README.md** : README 파일 수정은 해당 메시지로 통일

## Branch

형상 관리를 위해 브랜치 관리를 다음과 같이 진행합니다. (Github Flow 기반)

### main 브랜치

- main 브랜치의 모든 커밋은 언제 배포하든 문제가 없어야 하고, 언제든 새로운 브랜치를 만들어도 문제가 없어야 합니다.

### develop (topic) 브랜치

- 새로운 기능을 개발할 때에는 develop(topic) 브랜치를 main 브랜치로부터 생성합니다.
- 버그 수정도 develop 브랜치에서 진행합니다.
- develop 브랜치의 이름은 **기능을 설명하는 명확한 이름**으로 명명해야 합니다. 예: `user-content-cache-key`, `submodules-init-task`, `redis2-transition` 등.
- 해당 브랜치의 커밋은 기능이 완성되지 않았더라도 꾸준히 **Push**합니다.
