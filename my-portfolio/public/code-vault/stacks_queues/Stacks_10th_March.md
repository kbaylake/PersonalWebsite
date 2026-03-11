# **1**. Stacks & Queues

## 71. Simplify Path

https://leetcode.com/problems/simplify-path/description/

### Intuition

We are given a `string` path, we need to return a simplified path in the form of a string. 

### Constraints

1. Path consists of only English letters, digits and `[".","/","_"]` 
2. Path is a valid absolute Unix path
3. $1≤path.length≤3000$

### Core idea

Here are the given constraints and my interpretation

1. When we encounter a `period` 
    1. If stack exists
        1. If its a single period → do nothing `continue`
        2. if its a double period → pop the stack and `continue`
    2. if stack doesnt exist i.e only a single or double period in our path we are in the root directory
        1. in either single or double period cases return `'/'` 
2. In all other cases 
    1. `stack.append(f'/{i}')`
3. Handling all the empty directory edge cases
    1. If the `pathl` list is empty `return ‘/’`
    2. if we only have `'..' or '.'` in the path then again `reutrn '/'` 
    3. if the initial `pathl` isn’t empty but we are left with an empty stack due to repeated `'..'` we end up with an empty stack so we `return '/'`

### Code

```python
#10-03-2026
#71. Simplify Path
class Solution:
    def simplifyPath(self, path: str) -> str:
        stack=[]
        pathl = [p for p in path.split('/') if p]
        if not pathl:
            return '/'
        if len(pathl)==1 and (pathl[0]=='.' or pathl[0]=='..'):
            return '/'
        for i in pathl:
            if stack:
                if i=='.':
                    continue
                if i=='..':
                    stack.pop()
                    continue
            else:
                if i=='.' or i=='..':
                    continue
            stack.append(f'/{i}')
        if not stack:
            return '/'
        return ''.join(stack)
```

### Improvements

In taking care of the EMPTY casees i realised we will end up with an empty stack in the end in either of the cases so instead of using multiple if statements for each it makes sense to 

`return ''.join(stack) if stack else '/'` 

This is a far smarter way of solving it.

### Improved Code

```python
#10-03-2026
#71. Simplify Path
class Solution:
    def simplifyPath(self, path: str) -> str:
        stack=[]
        pathl = [p for p in path.split('/') if p]
        for i in pathl:
            if stack:
                if i=='.':
                    continue
                if i=='..':
                    stack.pop()
                    continue
            else:
                if i=='.' or i=='..':
                    continue
            stack.append(f'/{i}')
        return ''.join(stack) if stack else '/'
```

### Final Code’s Space and Time complexity Analysis

1. Time complexity
    1. Creating the path list costs us $O(n)$ linear time
    2. Iterating through the list costs us another $O(n)$ linear time 
    3. Appending to the list is an amortized $O(1)$ constant time complexity
    4. The final return statements costs $O(n)$ linear time again

Since all our operations cost $O(n)$ our final Time Complexity is $O(n)$

1. Space Complexity
    1. Creating the path list costs us $O(n)$
    2. All the operations in the for loop are $O(1)$
    3. As we are creating a stack based on the original string its space complexity is a worst case of $O(n)$ 
    4. The final statements time complexity is also $O(n)$ 

As all our operations here cost $O(n)$ space too our final Space Complexity is $O(n)$

# 1544. Make the strings Great

https://leetcode.com/problems/make-the-string-great/description/

## Intuition

We are given a `string` s, and we need to return a `string` where all the identical adjacent upper and lower case letter pairs are removed.

## Constraints

1. S contains only upper and lower case English letters
2. $1≤s.length≤100$

## Core Idea

1. Start by creating a, dictionary of lower and upper case letters and their relation, empty `stack` and iterating through the current string.
2. If the current letter is the upper case version of the previous letter `stack.pop() and continue` 
3. In any other case `stack.append(i)`

## Code

```python
#10-3-2026
#1544. Make the string great
import string
class Solution:
    def makeGood(self, s: str) -> str:
        stack=[]
        dc={char:char.upper() for char in string.ascii_lowercase}
        dc.update({c.upper(): c for c in string.ascii_lowercase})
        for i in s:
            if stack and dc[stack[-1]]==i:
                stack.pop()
                continue
            stack.append(i)
        return ''.join(stack)
```

## Space and Time complexity analysis

1. Time Complexity
    1. Since we are using a stack based on the og input $O(n)$
    2. Our dictionary $O(1)$
    3. For loop $O(n)$ as we are iterating through the entire dictionary and 
        1. pop() costs $O(1)$
        2. append costs $O(1)$ amortized
    4. Return operation $O(n)$ as we create a string from the stack

Final Time Complexity $O(n)$

1. Space Complexity
    1. Stack $O(n)$ as its proportional to the input size
    2. Dictionary $O(1)$ alphabet is constant
    3. Return Statement $O(n)$ as we are creating a string based on the stack

Final Space Complexity $O(n)$

# 933. Number of Recent Calls