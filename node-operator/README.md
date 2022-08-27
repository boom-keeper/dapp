# Boom-Keeper Node Operator

Node Operator는 다음과 같은 역할을 수행한다.
- `Geth`로 `checkUpkeep` 을 시뮬레이션 해보고, 실행여부를 결정한다.
- 실행여부가 결정되면, `performUpkeep`을 수행한다.