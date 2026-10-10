# DESIGN_PLAN.md

## 1. Colour Tokens (The Bazaar Theme)
- **Background / Tile:** `#E8F1EE` (Pale Irani-café celadon)
- **Surface:** `#FBFDFC` (White with a hint of warmth)
- **Ink / Text:** `#241632` (Deep aubergine)
- **Pillar 1 (Budget Builder):** `#C2185B` (Magenta - lac bangle)
- **Pillar 2 (Savings Quest):** `#0E8F6B` (Emerald)
- **Pillar 3 (Investment Lab):** `#1E9FC2` (Turquoise)
- **Pillar 4 (Scam Detective):** `#F2A900` (Turmeric)
- **Pearl Reward:** `#F4EEF8` with edge `#A58BC7`

## 2. Typography
- **Primary (Latin & Telugu):** `Anek Latin` / `Anek Telugu`
  - Headlines use heavy, slightly condensed settings mimicking hand-painted shop signs.
  - Body copy uses regular weight, 16-18px.
- **Urdu (RTL):** `Noto Nastaliq Urdu` with increased line-height.

## 3. Layout Concept: "The Bazaar"
The primary student view is a horizontally scrolling street map representing a vibrant Hyderabad bazaar. 
- **Bangle Stall:** Budget Builder (lac-bangle colours become ₹ tokens and envelopes)
- **Chai Corner:** Savings Quest (a jar and a 12-week chalkboard)
- **Pearl Merchant:** Investment Lab (pearl strings as diversification)
- **Gully Watch:** Scam Detective (a narrow lane, a shopkeeper's phone, signage that gets suspicious)

### ASCII Wireframes

#### Student Home (Bazaar Street)
```text
[ Navbar: < Learner ID >   [Pearl: 45]   [EN/TE/UR] ]
------------------------------------------------------
(Horizontally scrolling street)

    [ Bangle Stall ]       [ Chai Corner ]      [ Pearl Merchant ]
    (Unlocked/Lit)         (Moti waiting)       (Locked/Dim)
      Level 2                 Level 1              Level 0
    [ Enter ]              [ Enter ]            [ Locked ]

------------------------------------------------------
[ Footer: Learning simulation. No real money. ]
```

#### Game Screen (Gully Watch - Scam Detective)
```text
[ < Back to Street ]                     [ Level 1: The Refund ]
------------------------------------------------------
             _______________________
            |      Shop Phone       |
            |                       |
            |  SMS from: VM-PRIZE   |
            |                       |
            |  "You won ₹10,000!    |
            |   Send UPI PIN now."  |
            |                       |
            |  [ Flag as Scam ]     |
            |_______________________|

[ Moti ] "Why is this suspicious? (Tap the red flags)"
------------------------------------------------------
[ Footer: Learning simulation. No real money. ]
```

#### NGO Overview Dashboard
```text
[ ArthaQuest NGO ]  [ Programs ]  [ Schools ]  [ Impact ]
------------------------------------------------------
Overview: Financial Literacy for Grades 11-12 (v1.2)

[ Active Learners: 1,200 ]  [ Completion: 74% ]  [ Avg Gain: +19% ]

Schools Rollout:
------------------------------------------------------
School Name       | Status      | Active | Baseline -> Final
------------------------------------------------------
Govt Model High   | In Progress | 450    | 42% -> --
ZPHS Boys         | Completed   | 320    | 40% -> 65%
------------------------------------------------------
[ Export Aggregate CSV ]
```

## 4. Five Design Principles
1. **Playful but disciplined:** The student street is vibrant and horizontal; the staff dashboards are dense, calm, and vertical.
2. **Action-driven motion:** Animation only happens in response to learning (a pearl dropping, an envelope filling), not for mere decoration.
3. **Respect the learner:** No manipulative dark patterns (FOMO, countdowns, streaks, public leaderboards).
4. **Culturally grounded:** UI motifs (arches, signboards, chai glasses) reflect Hyderabad street life without generic "app-like" abstractions.
5. **Accessibility first:** High contrast, multi-language, RTL support, keyboard navigability, and clear tap targets.

## 5. Self-Review against Ban List (4.2)
- **Avoided generic cream/terracotta or acid/neon themes:** Used specific Hyderabad street-inspired colors (Celadon, Aubergine, Turmeric, Emerald).
- **Avoided identical rounded cards:** Shop fronts use awning scallops, dashboards use ruled tables. Removed soft grey shadows in favor of crisp, high-contrast borders.
- **Avoided arbitrary numbers (01/02/03):** The pillars are not numbered on the street; they are distinct physical shops.
- **No hover-lift or arbitrary fade-ins:** Motion is restricted to the initial street "wake" sequence and explicit rewards.
- **No emoji as icons:** Will use custom SVG illustrations for the shops and Moti.

---
*Assumptions for Phase 1 Build:*
- The existing `LakshyaFinLit.jsx` prototype will be incrementally dismantled into a modular architecture to support routing, RBAC, and proper state management using Zustand/Dexie.
- Real backend is not available; everything will use the requested `LocalMockAdapter` with IndexedDB.
