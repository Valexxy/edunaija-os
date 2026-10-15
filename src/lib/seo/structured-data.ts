/**
 * LearnNaija OS - Google SGE & Schema.org Structured Data Generator
 * 
 * Provides JSON-LD schemas for search engines and AI generative models:
 * - EducationalOrganization
 * - Course (NERDC Aligned)
 * - LearningResource
 * - FAQPage
 * - BreadcrumbList
 */

export const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://learnnaija.ng";

/**
 * EducationalOrganization Schema
 */
export function getEducationalOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "LearnNaija OS (EduNaija)",
    "alternateName": ["LearnNaija", "EduNaija OS"],
    "url": SITE_URL,
    "logo": `${SITE_URL}/icons/icon-512.png`,
    "description": "Sovereign Nigerian-first educational operating system delivering NERDC-aligned curriculum, statutory JAMB/WAEC/NECO CBT practice, TRCN-vetted live tutoring, and inter-school academic competitions.",
    "foundingLocation": {
      "@type": "Country",
      "name": "Nigeria"
    },
    "areaServed": {
      "@type": "AdministrativeArea",
      "name": "Nigeria"
    },
    "knowsLanguage": ["en", "pcm", "yo", "ig", "ha"],
    "hasCredential": {
      "@type": "EducationalOccupationalCredential",
      "name": "National Scholastic Merit Certificate",
      "credentialCategory": "Certificate of Academic Excellence",
      "recognizedBy": {
        "@type": "Organization",
        "name": "NERDC & Statutory Nigerian Examination Boards"
      }
    },
    "sameAs": [
      "https://twitter.com/LearnNaijaOS",
      "https://www.linkedin.com/company/learnnaija"
    ]
  };
}

/**
 * WebSite Schema with SearchAction
 */
export function getWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "LearnNaija OS",
    "url": SITE_URL,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${SITE_URL}/curriculum?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };
}

/**
 * Core NERDC Courses Schema
 */
export function getNationalCourseSchemas() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "Course",
      "name": "Senior Secondary General Mathematics (WAEC / JAMB UTME)",
      "description": "Comprehensive senior secondary mathematics covering algebraic factorization, quadratic equations, trigonometry, calculus, and statistics.",
      "provider": {
        "@type": "EducationalOrganization",
        "name": "LearnNaija OS",
        "sameAs": SITE_URL
      },
      "educationalLevel": "Senior Secondary School (SSS 1 - SSS 3)",
      "inLanguage": "en",
      "isAccessibleForFree": true,
      "courseCode": "NERDC-SSS-MATH-01"
    },
    {
      "@context": "https://schema.org",
      "@type": "Course",
      "name": "Senior Secondary Economics & Market Principles",
      "description": "Sovereign economics curriculum analyzing demand and supply theory, market equilibrium, banking, and public finance with Nigerian market analogies.",
      "provider": {
        "@type": "EducationalOrganization",
        "name": "LearnNaija OS",
        "sameAs": SITE_URL
      },
      "educationalLevel": "Senior Secondary School (Commercial / Arts)",
      "inLanguage": "en",
      "isAccessibleForFree": true,
      "courseCode": "NERDC-SSS-ECON-17"
    },
    {
      "@context": "https://schema.org",
      "@type": "Course",
      "name": "Senior Secondary Physics & Mechanics",
      "description": "Fundamental physics covering kinematics, Newton\'s laws of motion, momentum, heat energy, and wave properties with statutory CBT drills.",
      "provider": {
        "@type": "EducationalOrganization",
        "name": "LearnNaija OS",
        "sameAs": SITE_URL
      },
      "educationalLevel": "Senior Secondary School (Science Track)",
      "inLanguage": "en",
      "isAccessibleForFree": true,
      "courseCode": "NERDC-SSS-PHY-02"
    }
  ];
}

/**
 * FAQPage Schema
 */
export function getNationalFAQSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How does LearnNaija prepare students for JAMB UTME and WAEC?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "LearnNaija replicates official statutory examination conditions with 180-question timed JAMB CBT simulations, authentic WAEC Paper 1 objective drills, and algorithmic procedural question generation so students never run out of practice permutations."
        }
      },
      {
        "@type": "Question",
        "name": "Are the live tutors on LearnNaija certified?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. Every educator in the Vetted Mentors Directory is accredited by the Teachers Registration Council of Nigeria (TRCN), NIN-verified, and subject to NDPA 2023 parental consent before encrypted live sessions commence."
        }
      },
      {
        "@type": "Question",
        "name": "Does LearnNaija work offline without internet data?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. LearnNaija is engineered as a Progressive Web App (PWA) with client-side IndexedDB caching. Students can practice CBT tests, review mistake autopsy explanations, and study curriculum topics with zero active internet data."
        }
      }
    ]
  };
}

/**
 * BreadcrumbList Schema Helper
 */
export function getBreadcrumbListSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`
    }))
  };
}
