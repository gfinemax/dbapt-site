# Request Summary

## Requested Feature Slice

Stabilize the `찾아오시는 길` location panel where embedded `map.naver.com` can show a redirect-loop error in some browsers:

- remove the redirect-prone Naver Maps search iframe from the public page
- keep the office address and transit details visible without relying on a third-party iframe
- keep the `네이버 지도에서 보기` action as an external link

## Explicitly Excluded Scope

- Changing public navigation structure
- Changing organization/about copy outside the location panel
- Changing authentication boundaries
- Adding a new map provider integration or API key
- Changing contact phone number, consultation time, or transit route facts

## Candidate Governing Specification

`docs/superpowers/specs/2026-05-25-daebang-housing-cooperative-portal-design.md`

## Unanswered Decision

none
