# Request Summary

## Requested Feature Slice

Stabilize the `찾아오시는 길` location panel while keeping an actual Naver map visible:

- replace the redirect-prone `map.naver.com` search iframe with the Naver Maps JavaScript SDK
- keep the office marker pinned to the verified office coordinate instead of moving it with client-side geocoding
- add a selectable `대방동 지역주택조합 사무실 찾아오시는 길안내` section with station-by-station village bus guidance and walking directions
- remove `상담시간` from the `조합 사무실 정보` block
- remove the `주차` row from the public location panel
- show a simple blinking `+ 자세히보기` affordance on the route-guide selector
- remove the specific trust-company name from the `자금관리 신탁사` partner card
- revise the history-section headline and support copy to acknowledge member distrust and emphasize renewed, transparent, cooperative-led execution
- add a `2026.04.18` regular general meeting milestone that states the 2026 regular meeting was formally held after the founding general meeting
- remove the `2013.05.01` leader-change milestone from both the highlighted timeline and the full history list
- keep the office address and transit details visible
- keep the `네이버 지도에서 보기` action as an external link

## Explicitly Excluded Scope

- Changing public navigation structure
- Changing authentication boundaries
- Adding a non-Naver map provider
- Changing map account credentials directly in source code
- Changing contact phone number, consultation time, or transit route facts
- Adding reservation, inquiry submission, or live route-search functionality

## Candidate Governing Specification

`docs/superpowers/specs/2026-05-25-daebang-housing-cooperative-portal-design.md`

## Unanswered Decision

none
