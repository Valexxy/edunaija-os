# Application for NCC Zero-Rating Initiative

## Platform Description and Educational Impact
EduNaija OS is a comprehensive EdTech platform designed to help Nigerian students prepare for high-stakes examinations such as JAMB and WAEC. Our mission is to democratize access to quality education. By providing our services zero-rated, we ensure that students from low-income backgrounds can access premium study materials, AI tutoring, and adaptive assessments without the barrier of mobile data costs.

## Technical Architecture Overview
To ensure only educational content is accessed via zero-rated data:
- All traffic is routed through dedicated gateways (`api.edunaija.ng`).
- Strict firewall rules and deep packet inspection prevent access to non-educational domains.
- Embedded media (images/videos) is hosted on a separate, controlled CDN with restrictive CORS policies.
- AI features are tightly sandboxed to only answer exam-related queries.

## Traffic Analysis
- **Estimated Average Usage**: 15 MB/user/day (primarily text, low-res images of past questions, and lightweight API calls).
- **Peak Hours**: 4 PM - 10 PM daily, and weekends.

## Student Reach Projections
We project reaching 500,000 active students within the first 6 months, distributed broadly across the nation, with a specific focus on under-served states in the North-East and North-West.
- Lagos & South-West: 150,000
- South-East & South-South: 100,000
- North-Central & FCT: 100,000
- North-East & North-West: 150,000

## Security and Data Privacy Measures
- End-to-end encryption for all API communication (TLS 1.3).
- Strict adherence to the Nigeria Data Protection Act (NDPA).
- No third-party tracking or advertising scripts on zero-rated endpoints.
- User data anonymization for analytics.

## Proposed IP Ranges to Whitelist
- `102.129.230.0/24`
- `197.210.15.0/24`
- `cdn.edunaija.ng` (Dynamic IP via Anycast, request specific ASNs for peering)

## Contact Information
**Name**: EduNaija OS Engineering Team  
**Email**: public-policy@edunaija.ng  
**Phone**: +234 800 EDU NAIJA  
**Address**: Yaba, Lagos, Nigeria  
