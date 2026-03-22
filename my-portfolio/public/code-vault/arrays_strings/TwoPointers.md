# 2 Pointers Target

## Intuition

We are given a sorted array of ints, and an int target. We need to return the 2 numbers in nums which sum up to our target.

## Constraints

1. We have only one unique solution
2. List is sorted
3. Time Complexity $O(n)$
4. Space Complexity $O(1)$

## Core Idea

Eg - `[1,3,4,5,7], target=9`

1. Initialize left to 0 and right to len(nums)-1
2. Start a while loop `while left<=right` 
3. As we know that our nums array is sorted
    1. If sum<target
        1. left+=1
    2. if sum>target
        1. right-=1
    3. if sum==target
        1. return [nums[left],nums[right]]

## Code

```python
#eg nums=[1,3,4,5,7], target = 9
def getTarget(nums,target):
    left=0
    right=len(nums)-1
    while left<=right:
        sum=nums[left]+nums[right]
        if sum<target:
            left+=1
        if sum>target:
            right-=1
        if sum==target:
            return [nums[left],nums[right]]
    return -1 # Returns -1 if solution doesnt exist in the array
ans=getTarget([1,3,4,5,7],20)
print(ans)
```

# Container With Most Water

## Intuition

We are given an array of ints. We need to return the max volume of water a container can hold an int.

## Core idea.

1. How to calculate max capacity?
    1. `curr=min(height[left],height[right])*(right-left)` → This gives us the area of the curve
2. How will we get the maximum area?
    1. What we want is to find the max product not just the max height
    2. We will start with left=0 and right=len(heights)-1
    3. We will use a while loop `while left<=right` 
        1. `*if height[left]<height[right]`* 
            1. left+=1
        2. if height[right]<height[left]
            1. right-=1
        3. ans=max(ans,curr)

```python
#11. Container With Most Water 
#22-03-2026
class Solution:
    def maxArea(self, height: List[int]) -> int:
        left=0
        right=len(height)-1
        ans=0
        while left<=right:
            curr=min(height[left],height[right])*(right-left)
            ans=max(ans,curr)
            if height[left]<height[right]:
                left+=1
            else:
                right-=1
        return ans
        
```

# 3 Sum

## Intuition

We are given an integer array, containing positive and negative integers. We need to return a list of list of ints, which contains 3 numbers from our input.

1The 3 numbers must be distinct and sum to 0

## Constraints

1. All 3 numbers mut be unique
2. We can have more than 1 unique solution
3. 3≤len(nums)≤3000
4. Space Complexity must be $O(1)$

## Core Idea

1. Start by initializing `left=0, right=len(nums)-1` 
2. Check `if 0-(nums[left]+nums[right] in nums`
    1. if it is in nums
        1. `return [nums[left],nums[right],0-(nums[left]+nums[right]]`
    2. else
        1. Continue