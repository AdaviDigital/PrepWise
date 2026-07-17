from build import build_page, SITE_URL
import pages_home

ORG_SCHEMA = f"""<script type="application/ld+json">
{{
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  "name": "PrepWise",
  "url": "{SITE_URL}",
  "logo": "{SITE_URL}/images/logo.png",
  "description": "Nigeria's AI-powered study assistant and examination success platform for primary, secondary and tertiary students.",
  "address": {{
    "@type": "PostalAddress",
    "addressLocality": "Lagos",
    "addressCountry": "NG"
  }},
  "sameAs": ["https://facebook.com/prepwise", "https://twitter.com/prepwise", "https://instagram.com/prepwise"]
}}
</script>"""

build_page(
    "index.html",
    "PrepWise \u2014 Nigeria's AI-Powered Study Assistant & Exam Prep Platform",
    "Learn smarter, prepare better and succeed with confidence. AI tutoring, CBT practice exams and past questions for Common Entrance, BECE, WAEC, NECO and JAMB.",
    pages_home.content(),
    active="index.html",
    extra_head=ORG_SCHEMA,
)
