# Request Summary

## Requested Feature Slice

Stabilize the `찾아오시는 길` location panel while keeping an actual Naver map visible:

- replace the redirect-prone `map.naver.com` search iframe with the Naver Maps JavaScript SDK
- keep the office address and transit details visible
- keep the `네이버 지도에서 보기` action as an external link

## Explicitly Excluded Scope

- Changing public navigation structure
- Changing organization/about copy outside the location panel
- Changing authentication boundaries
- Adding a non-Naver map provider
- Changing map account credentials directly in source code
- Changing contact phone number, consultation time, or transit route facts

## Candidate Governing Specification

`docs/superpowers/specs/2026-05-25-daebang-housing-cooperative-portal-design.md`

## Unanswered Decision

none
