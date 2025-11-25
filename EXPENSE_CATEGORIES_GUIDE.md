# Expense Categories for AI Agent Consultancy Business

## 📋 Recommended Categories for Your Google Sheet

Replace the current categories in your Expenses tab dropdown with these AI consultancy-specific categories:

### Core Business Categories

1. **AI/API Costs** ⭐
   - OpenAI API usage
   - Anthropic Claude API
   - Google AI services
   - Other LLM API costs
   - Vector database costs (Pinecone, Weaviate)

2. **Cloud Infrastructure**
   - AWS/GCP/Azure hosting
   - Database hosting
   - CDN costs
   - Storage costs
   - Compute resources

3. **Software & Tools**
   - Development tools (GitHub, VS Code extensions)
   - Project management (Linear, Jira, Notion)
   - Communication (Slack, Discord)
   - Design tools (Figma)
   - Analytics tools

4. **Marketing & Advertising**
   - Google Ads
   - LinkedIn Ads
   - Facebook/Instagram Ads
   - Content marketing
   - SEO tools
   - Social media management

5. **Sales & Business Development**
   - CRM software (HubSpot, Salesforce)
   - Sales commissions
   - Lead generation tools
   - Sales team expenses
   - Client entertainment

6. **Salaries & Compensation**
   - Employee salaries
   - Contractor payments
   - Freelancer fees
   - Bonuses
   - Benefits

7. **Professional Services**
   - Legal fees
   - Accounting & bookkeeping
   - Consulting fees
   - Tax preparation
   - Business advisory

8. **Office & Operations**
   - Co-working space rent
   - Office supplies
   - Utilities
   - Internet & phone
   - Equipment

9. **Training & Development**
   - Online courses
   - Certifications
   - Conference tickets
   - Books & learning materials
   - Team training

10. **Research & Development**
    - Experimental AI models
    - Proof of concept projects
    - Innovation initiatives
    - Testing environments

11. **Customer Success**
    - Support tools
    - Customer onboarding
    - Success team costs
    - Documentation tools

12. **Other**
    - Miscellaneous expenses
    - One-time costs
    - Uncategorized

---

## 🎯 Categories Used in CAC Calculation

The backend currently uses these categories for **Customer Acquisition Cost (CAC)**:
- Marketing & Advertising
- Sales & Business Development

All expenses in these categories are summed and divided by new customers acquired.

---

## 🎯 Categories Used in Gross Margin Calculation

The backend uses this category for **direct costs**:
- AI/API Costs

Formula: `Gross Margin = (Revenue - AI/API Costs) / Revenue × 100`

---

## 📝 How to Update Your Google Sheet

### Option 1: Data Validation Dropdown (Recommended)

1. **Select the Category column** (Column B in Expenses tab)
2. **Go to:** Data → Data validation
3. **Criteria:** List of items
4. **Items:** Copy-paste this list:
   ```
   AI/API Costs,Cloud Infrastructure,Software & Tools,Marketing & Advertising,Sales & Business Development,Salaries & Compensation,Professional Services,Office & Operations,Training & Development,Research & Development,Customer Success,Other
   ```
5. **Check:** Show dropdown list in cell
6. **Click:** Save

### Option 2: Manual Entry

Just type the category names when adding expenses. Make sure they match exactly!

---

## 💡 Sample Expenses with New Categories

```
Date       | Category                      | Amount | Description                        | Added_By
2025-11-01 | Marketing & Advertising       | 2500   | Google Ads - November Campaign     | Pranav
2025-11-02 | AI/API Costs                  | 450    | OpenAI API Usage                   | System
2025-11-05 | Sales & Business Development  | 800    | Sales team commissions             | Fazil
2025-11-08 | Marketing & Advertising       | 1800   | LinkedIn Sponsored Content         | Pranav
2025-11-10 | Salaries & Compensation       | 15000  | Developer Salaries                 | HR
2025-11-12 | Software & Tools              | 200    | GitHub Enterprise                  | IT
2025-11-15 | Marketing & Advertising       | 3200   | Content Marketing Agency           | Pranav
2025-11-18 | AI/API Costs                  | 520    | Google Cloud AI Services           | System
2025-11-20 | Office & Operations           | 1200   | Co-working Space Rent              | Admin
2025-11-22 | Marketing & Advertising       | 950    | Facebook Ads Campaign              | Pranav
2025-11-15 | Cloud Infrastructure          | 450    | AWS Hosting                        | IT
2025-11-18 | Professional Services         | 1500   | Legal consultation                 | Admin
2025-11-20 | Training & Development        | 300    | AI certification course            | HR
```

---

## 🔄 Backend Code Updates

I'll update the backend to recognize these new categories:

### CAC Calculation
Will look for:
- `Marketing & Advertising`
- `Sales & Business Development`

### Gross Margin Calculation
Will look for:
- `AI/API Costs`
- `Cloud Infrastructure` (optional, can be added as direct cost)

---

## ✅ Action Items

1. [ ] Update Google Sheet with data validation dropdown
2. [ ] Update existing expense categories to match new list
3. [ ] Backend code will be updated automatically
4. [ ] Test CAC calculation with new categories
