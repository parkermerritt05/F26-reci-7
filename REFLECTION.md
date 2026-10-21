# Reflection

**Name / Andrew ID:** Parker Merritt / pmerritt

**Recitation group members (Task 2):** Geo

---

### 1. Valid but weak

Pick a property you wrote that passes on the correct implementation but
kills few or no mutants. Why is it still a *valid* property? Describe a
concrete bug (not one of our mutants) that it *would* catch.

If guess gets a letter injected outside secret guess set, then number of greens should not increase. This is a valid property because if the guess word and secret word is taken from {'A', 'B'}, then injecting 'C' into the guess set will never add more greens to the result because the result cannot have this letter.

### 2. A generator problem, not a property problem

Describe a mutant, from either task, that survived or was flaky because of
your **generator** rather than your property. What did the generator fail to
produce? How did you fix it? Paste the runner output from before and after.

For ensuring a letter is not credited more times than the secret word contains it, it is statistically implausible to get frequent repeat inputs with the entire alphabet. So, we restricted the alphabet to three letters.

Before:
~ singlePass     flaky: killed in 4/5 runs  by: never credits a letter more times than the secret contains it
      Counterexample: ["AATAA","AAAAA"]
      AssertionError: expected 5 to be less than or equal to 4

After:
✔ singlePass     killed  by: never credits a letter more times than the secret contains it
      Counterexample: ["XXXXY","XXYXY"]
      AssertionError: expected 2 to be less than or equal to 1

### 3. Reading a counterexample

Paste one counterexample that the mutation runner printed for a killed
mutant. In 2–3 sentences, explain using the *specification* why that input
exposes the bug.

✔ allBlack       killed  by: guessing the secret gives all greens; If start with same letter, than result must start with green
      Counterexample: ["AAAAA"]
      AssertionError: expected [ 'B', 'B', 'B', 'B', 'B' ] to deeply equal [ 'G', 'G', 'G', 'G', 'G' ]

'G' (green):  guess[i] === secret[i] for the result specification, and because the same word is input, guess[i] === secret[i] for all 0 <= i <= 5, so the resulting array must be ['G', 'G', 'G', 'G', 'G']

### 4. Your project

Name one function or module in your team's project that would benefit from
property-based testing. State two properties in English, name the pattern of
each, and describe the generator you'd need, including anything about its
inputs that a naive generator would get wrong.

My implimentation of settings through the UI could benefit from property based testing in two ways:

1. If a setting changes three times consecutively where each change moves from an ordered list, than the final setting should be the same as the original setting (as there is Ask, Allow, and Deny settings). I would need to generate a json object that each value has a setting type.

2. If a setting is Deny, then the user should never be prompted with the message asking for permission. I would need to generate a valid set of requests where I set each of them as deny and ensure they do not prompt the user. Naive input generation could mean that none of the settings are set to deny, so the test is never utilized.