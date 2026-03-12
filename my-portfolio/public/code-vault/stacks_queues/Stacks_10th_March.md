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

## Intuition

We are given with a series of separate `int` inputs. Each input is a ping at time `t` , our objective is to return the number of pings in the last 3000ms. We need to return a `int` which represents the number of pings in the last 3000ms.

## Core idea

Check if the oldest pings are within 3000ms i.e. t-3000 and pop

Append new pings to the queue

at each step return len queue

## Code

```python
#10-3-2026
#933, Number of recent calls
from collections import deque
class RecentCounter:

    def __init__(self):
        self.queue=deque()    
    def ping(self, t: int) -> int:
        while self.queue and self.queue[0]<t-3000:
            self.queue.popleft()
        self.queue.append(t)
        return len(self.queue)
```

## Time and Space Complexity Analysis

1. Time Complexity
    1. As we are using a deque our time complexity for this is $O(n)$
    2. For the while loop $O(n)$ as each append and pop operation cost $O(1)$ iterated a worst case of $n$ times
    
    Final Time Complexity is $O(n)$
    
2. Space Complexity
    1. We are creating a deque based on the input thus its  a worst case $O(n)$ space
    2. Operations in the while loop simply append to the queue so those are conisdered

Final Space Complexity is $O(n)$ 

# **Moving Average from Data Stream**

https://leetcode.com/problems/moving-average-from-data-stream/

## Intuition

We are given a series of int inputs and we need to return their moving average so according to val. Eg if input is 3, then we return the moving average of a maximum of 3 numbers.

## Core Idea

1. Create an empty queue
2. Create a total variable
3. In the `next` function
    1. Add the current value to the total
    2. Append the value to the queue
    3. If len(queue)>size
        1. Then pop the left most element
        2. Subtract siad element from the total
    4. Return  `total/len(queue)`

# Code

```python
#Moving Data From Stream
```
from collections import deque
class MovingAverage:

    def __init__(self, size: int):
        self.queue=deque()
        self.max=size
        self.total=0

    def next(self, val: int) -> float:
        self.total+=val
        self.queue.append(val)
        if len(self.queue)>self.max:
            a=self.queue.popleft()
            print(a)
            self.total-=a
        return self.total/len(self.queue)
        
# Your MovingAverage object will be instantiated and called as such:
# obj = MovingAverage(size)
# param_1 = obj.next(val)
```

## Space and Time Complexity

1. Time Complexity
    1. As every operation done is $O(1)$ in a deque, we get $O(1)$

Total $O(1)$

1. Space Complexity
    1. As we use a queue our space complexity is $O(n)$ for the queue
    2. All other operations are $O(1)$

Overall $O(n)$

# Next Greatest Element

https://leetcode.com/problems/next-greater-element-i/description/

## Intuition

We are given 2 lists of ints and we  need to return a `list[int]` of the next greatest value i.e. the first value in the list which is greater than the current number, if it exists else -1.

1. Find the position of the element in the list `nums2` 
2. If the next element i.e. `nums2[pos+1]>curr` then add it to the queue
3. Else add -1
4. If the number is the last element in `nums2` then return -1

## Core Idea

This would be a bure force approach.

Instead we use a stack to create a dictionary.

We start by adding elements to the stack from `nums2` if the element is greater keep popping. In any case push it to the stack.

We then use a simple list comphrension statment to return the matching values.

If value exists in dictionary, this means the next greatest value exists and is a part of the dict.

Else return -1

## Code

```python
#Date: 12-03-2026
#496. Next Greatest Element 1
from collections import deque
class Solution:
    def nextGreaterElement(self, nums1: List[int], nums2: List[int]) -> List[int]:
        stack=[]
        dc={}
        for i in range(len(nums2)):
            while stack and  nums2[i]>stack[-1]:
                dc[stack.pop()]=nums2[i]
            stack.append(nums2[i])
        return [dict.get(i, -1) for i in nums1]
            
```

## Space & Time Complexity Analysis

1. Time Complexity
    1. The first loop which we use to create the hash map has all $O(1)$ operaions 
    2. The return list comp has $O(1)$ operations too
    
    Final Time Complexity is $O(m+n)$ where $m$ is the lsize of `nums2` and $n$ is the size of `nums1`
    
    The reason its + not * is that we run both loops in sequence not nested
    
2. Space Complexity
    1. As we are creating a hashmap its worst case space complexity is $O(m)$ as worst case all elements in `nums2` have a next greatest element same for the stack
    2. The return dictionary costs $O(n)$ as its size is proportional to the size of `nums1` 

Overall Space Complexity is $O(m)$ as $m>n$ we can ignore n

# Daily Temperature

## Intuition

We are given a list of ints. We need to return a list of ints, which has the number of days for the temperature to be greater than the current days temp.

### Core idea

1. Create a stack
2. As you iterate through the list keep pushing elements to the stack
3. If any element is greater than the element at the top keep popping until the top element is greater than the current element
4. When you pop subtract the indexes to get the answer

## Code

```python
#Date: 12-03-2026
#739. Daily Temperatures
class Solution:
    def dailyTemperatures(self, temperatures: List[int]) -> List[int]:
        stack=[]
        ans=[0]*len(temperatures)
        for i in range(len(temperatures)):
            while stack and temperatures[i]>temperatures[stack[-1]]:
                idx=stack.pop()
                ans[idx]=(i-idx)
            stack.append(i)
        return ans
```

## Time and Space Complexity Analysis

1. Time Complexity
    1. As we are iterating through the entire input list our loops complexity is $O(n)$
    2. Each operation in the loop is $O(1)$

Overall Time Complexity is $O(n)$

1. Space complexity
    1. Our stack has a worst case of $O(n)$ as its proportional to the input size
    2. The variable idx in the while loop is $O(1)$

Overall Space Complexity $O(n)$