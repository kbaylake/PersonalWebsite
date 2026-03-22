## Permutations II

### Intuition

We are given a list which may contain duplicates, we need to generate a list of lists of ints, which contains all UNIQUE permutations of the original list.

Constraints

1. Input May contain duplicates
2. Output must be unique
3. Input may contain negative integers

### Important Point

We only generate VALID cases 

### Base Case

`len(path)==len(nums)` this is because we are only generating valid numbers in the first place

### Recursive Case

We have sorted the  list before backtracking or any recursive case. This is done as we will need to handle duplicates.

We can add a number only if we haven't previously picked it 

And as our list is sorted, if we start a backtracking call from the first instances of that number we cannot start another call from any subsequent instances.

### Code

```python
from  collections import Counter
class Solution:
    def permuteUnique(self, nums: List[int]) -> List[List[int]]:
        if len(nums)==1:
            return [nums]
        ans=[]
        nums.sort()
        dc=Counter(nums)
        def backtrack(curr):
            if len(curr)==len(nums):
                ans.append(curr[:])
                return 
            for i in range(0,len(nums)):
                if nums[i]==nums[i-1]:
                    continue
                if curr.count(nums[i])<dc[nums[i]]:
                    curr.append(nums[i])
                    backtrack(curr)
                    curr.pop()
        backtrack([])
        return ans
```

The goal was to generate unique combinations

We have duplicates and we can only  use each element 2 times

To check howmany times an element is used with $O(1)$ we create a dictionary with the frequency of each element.

To prevent duplicates we sort the array and check if a new branch is being created by the same number by checking if it is the same as the prev number this allows us to only create one branch starting from `1`  for example so duplicates are not generated.

We check if the length of the current solution is = length of the input in that case we have successfully generated a valid permutation and we add it to the ans

### Time Complexity

sorting uses time sort in python with a worst case time complexity of $O(n*log(n))$ 

Creating a dictionary using the Counter library has a worst case time complexity of $O(n)$

Checking for length is $O(1)$

Appending the `curr` to `ans` is $O(n)$ as we create a copy of current before appending

For loop and backtracking calls run `n!` times with `n` branches and `count` has a time complexity of $O(n)$

Overall Time complexity

$O(n^2*n!)$

## The k-th Lexicographical String of All Happy Strings of Length n

### Intuition

We need to generate a list of strings where each string is a happy string of length `n` and only contains characters from `[a,b,c]` and is sorted. We then need to return the `kth` element of the list or “” if the list has less than `k` elements

### Constraints

1. No 2 identical letters can be next to each other
2. Each element in the list must be unique
3. Each string must be of length `n`
4. Solutions must be generated in order

### Base Case

`Len curr == n`

### Recursive Case

We can only add a character if it is not the same as `curr[-1]`

### Code

```python
class Solution:
    def getHappyString(self, n: int, k: int) -> str:
        possible=3*(2**(n-1))
        if k>possible:
            return ''
        ans=[]
        st=('a','b','c')
        def backtrack(curr):
            if len(curr)==n:
                ans.append(''.join(curr[:]))
                return
            for char in st:
                if curr[-1]!=char:
                    curr.append(char)
                    backtrack(curr)
                    curr.pop()
        for i in st:
            backtrack([i])
        return ans[k-1]
```

There are  only $3*2exp(n-1)$ possible solution for any given n

As we know this we check if `k` is greater than that, if it is then we simply `return ''` saving time in such cases

We now define a tuple in logographical order (alphabetical order)

We check for the base case if length of the current solution is `n` and  `return` the reason we use curr as a list and not string is that appending to a list is $O(1)$ as its mutable and string is $O(n)$ which would significantly increase the time complexity and is more efficient to use the `''.join()` which creats a string only once instead of every time we need to add a new character.

AS we are iterating through the `tuple` in order, we only generate solutions in order, saving us $O(n*log(n))$ of pythons built in `sort` function.

As we need to add the next character based on the previous character, we have a forloop outside the backtracking function for getting all 3 letters as the starting point, and as backtracking generates all happy strings of `a` in order before moving to `b` and `c` all our solutions are in order.

### Time Complexity

As we already know we have a max of $3*2exp(n-1)$ solutions, we use the `join` function and our code strictly generates this number of solutions the worst case time complexity is $O(n*2^n)$

# Binary Search

## 74. Search a 2d Matrix

### Intuition

We need to perform a binary search on a 2d matrix and check for the existence of a `target` value, and return a `boolean` 

### Constraints

1. The input is a `matrix` i.e. a `2d` array
2. We need to perform a search in $O(log(n))$

### Core idea

As a matrix is a 2d array and all elements are in asscending order, we can treat it as a 1d array, to do so we find row and column values based on mid, and perform regular binary search

```python
class Solution:
    def searchMatrix(self, matrix: List[List[int]], target: int) -> bool:
        m,n=len(matrix),len(matrix[0])
        low=0
        high=m*n-1
        while low<=high:
            mid=(low+high)//2
            row=mid//n
            col=mid%n
            val=matrix[row][col]
            if val==target:
                return True
            if val<target:
                low=mid+1
            else:
                high=mid-1
        return False
```

## 35. Search Insert Position

### Intuition

We need to return an `int` , the position of an element within a sorted array, if it doesn’t exist in the array, return the position it should be sorted in.

### Constraints

1. Array is sorted
2. Element may or may not be in the array
3. Perform true binary search $O(log(n))$

### Core Idea

We perform regular binary search as usual, and return `mid` , if we find the target, else we wait for `low>high`  and return `low` which is the position the element should be inserted in.

### Code

```python
class Solution:
    def searchInsert(self, nums: List[int], target: int) -> int:
        low=0
        high=len(nums)-1
        while low<=high:
            mid=(low+high)//2
            if nums[mid]==target:
                return mid
            if nums[mid]<target:
                low=mid+1
            else:
                high=mid-1
        return low
```

## 2300. Successful Pairs of Spells and Potions

### Intuition

We need to return a `list` of `ints` , which contains the number of combinations of potions and spells which are  successful. A pair is successful if the product of the spell and potion is ≥ success.

### Constraints

1. All ints are positive
2. We need to sort potions to perform binary search

### Core idea

We need to find the minimum potion in a sorted list of potions, to get the number of successful combos for each spell.

To do so, we sort potions. 

We then perform a binary search, on the first insertion point of `success/spell`  for each spell, this returns the position of the potion. We then do `len(potions)-ans` to get the number of `Successful pairs` and insert that into the ans list.

### Code

```python
class Solution:
    def successfulPairs(self, spells: List[int], potions: List[int], success: int) -> List[int]:
        potions.sort()
        def binarySearch(nums,target):
            low=0 
            high=len(nums)
            while low<high:
                mid=(low+high)//2
                if nums[mid]>=target:
                    high=mid
                else:
                    low=mid+1
            return len(potions)-low
        ans=[binarySearch(potions,success/i) for i in spells]
        return ans
```

### Time Complexity

Sorting is $O(n*log(n))$ as pythons built in search uses time sort

Binary search is $O(log(n))$

Generating the ans is $O(m*log(n))$ - this is as we are performing `m` binary searches to get the answer.

The final time complexity is $O((m+n)*log(n))$

## Generate Parenthesis

Intuition 

We are asked to generate all **valid combinations** of n pairs of parenthesis

A valid parenthesis string must satisfy the following 3 conditions

1. The number of opening brackets cannot exceed n
2. The number of closing cannot exceed the number of opening **already placed**
3. Total length of the parenthesis string must be `2n` 

### Important point

We only generate **VALID** strings rather than generating all strings then filtering

### Base Case

The string generated so far is of length `2n`  i.e Number of opening brackets = Number of closing brackets = `n`  

In this scenario we add the string to the final answer

### Recursive Case

At each step we have 2 choices, add Opening  if number of opening brackets is less than n and Closing number of closing brackets is less than number of opening brackets `already placed` (This ensures we never exceed `n` opening brackets and we never close more brackets than opened)

### Core idea

Each backtracking recursive call represents 2 choices

1. Opening bracket added
2. Closing bracket added

### Code

```python
class Solution:
    def generateParenthesis(self, n: int) -> List[str]:
        ans=[]
        def backtrack(path,opening,closing):
            if len(path)==2*n:
                ans.append(''.join(path[:]))
                return
            if opening<n:
                path.append('(')
                backtrack(path,opening+1,closing)
                path.pop()
            if closing<opening:
                path.append(')')
                backtrack(path,opening,closing+1)
                path.pop()
        backtrack([],0,0)
        return ans
```

## Combination Sum II

### Intuition

We are asked to return a list of lists of ints, which all sum up to a target

Constraints

1. Each candidate solution must be unique
2. Each number in the input may only be used 0 or 1 times

### Important Point

We only generate solutions which are valid in the first place, i.e use each input element only once, sum up to target, and have no duplicates

### Base Case

As we are only generating valid solutions our base case would be

If curr==Target

### Recursive Case

`candidates = [10,1,2,7,6,1,5], target = 8`

We can either select a number or not select it

If $curr+nums[i]≤Target$ we will select the number

### Core Idea

Select a digit only if

1. $Curr+ nums[i] ≤ Target$
2. We have explored it before - for duplicates, if we have selected the first one eg selected the first `1`  we wont start a backtracking call from the second one, this ensures we don’t miss out on solutions with both `1,1` and only generate UNIQUE solutions
3. We only select a digit once thus i+1
4. After selecting a digit we only select digits after it thus forloop starting from `pos`

### Code

```python
class Solution:
    def combinationSum2(self, candidates: List[int], target: int) -> List[List[int]]:
        ans=[]
        candidates.sort()
        print(candidates)
        def backtrack(path,pos,curr):
            if curr=target:
                ans.append(path[:])
                return
            for i in range(pos,len(candidates)):
                if i>pos and candidates[i]==candidates[i-1]:
                    continue
                next=curr+candidates[i]
                if next<=target:
                    path.append(candidates[i])
                    backtrack(path,i+1,next)
                    path.pop()
        backtrack([],0,0)
        return ans
```

This problem has duplicates in the input

But we also dont want duplicate solutions

The first step in combating this is to sort the array

Backtracking

WE first check the base case

If we are at the target we create a copy of our current `path` and append it to the `ans` 

Now on the recursive Case

We start by checking if we can select each number - the reason we have pos is that if we have selected a number we can only select numbers after that number eg [1, 1, 2, 5, 6, 7, 10] we are at pos=3, value=2, we can now only select any values with an index > 3, thus we do 2 things

In the next back tracking call we start with i+1 

In the next loop iteration we start with the next index only

The reason we do this and also pop after the backtracking call is to explore both possibilities of including and exlcuding the number

The reason we have this line `if i>pos and candidates[i]==candidates[i-1]` is to prevent duplicates, eg you have already selected the first one and started backtracking calls from it, you can select the 2nd one as `*i` will be less than `pos`* but if we dont select 1 and select the 2nd one, we prevent this as `i>pos`

We then return the ans

### Time Complexity

Sorting - $O(n*log(n))$ we use pythons built in sort function which uses timesort

Now coming to the `Backtrack` Functions

The for loop iterates n times having a time complexity by itself of $O(n)$

Because for each value we have 2 backtrack calls as worst case i.e. selecting or not selecting it the time complexity is $O(2^n)$

The pop time complexity is $O(1)$ 

The append time complexity is $O(n)$ as `[:]` creates a copy of the list

The overall time complexity is $O(n*2^n)$ as its the greatest degree 

## Combination sum III

### Intuition

We need to generate a list of lists of ints, where each list is of length `k`  and sums up to `n` 

### Constraints

1. Each solution must be unique
2. We can only use numbers 1,9
3. Each number may only be used once or not at all

### Base Case

If the length of `path` is `k` and current sum `curr` is `n` , we append and return

### Recursive Case

If the current sum is less than n and the length of the path after adding the next digit is less than k

We append the current number to the path

we call the function only using the next number onwards 

### Core idea

Select a digit only if $curr+i<=n and len(path)<k$

### Code

```python
class Solution:
    def combinationSum3(self, k: int, n: int) -> List[List[int]]:
        ans=[]
        def backtrack(path,pos,curr):
            if curr==n and len(path)==k:
                ans.append(path[:])
                return
            for i in range(pos,10):
                if curr+i<=n and len(path)<k:
                    path.append(i)
                    backtrack(path,i+1,curr+i)
                    path.pop()
        backtrack([],1,0)
        return ans
```

## Permutations

We think of the base case as reaching a list of length one, as the permutation of that number is only it self thus we return [nums].

In the recursive case, we seperate the list in 2 parts, one is the first element itself, and the other part is 

And we remove the selected number from curr to prevent duplicates.

class Solution:
def permute(self, nums: List[int]) -> List[List[int]]:
if len(nums)==1:
return [nums]
l1=nums[:1]#[x]
l2=self.permute(nums[1:])
temp=[l1+i if j==0 else i+l1 if j==len(i) else i[:j]+l1+i[j:] for i in l2 for j in range(len(i)+1)]
return temp

## Subsets

We start with an empty list and add an element, after that we can only add elements in the original list nums after the selected element

Base case is if len of the current item is greater then len of nums which is no longer a subset

```
class Solution:
def subsets(self, nums: List[int]) -> List[List[int]]:
def backtrack(curr,i):
if i>len(nums):
return curr
ans.append(curr[:])
for j in range(i,len(nums)):
curr.append(nums[j])
backtrack(curr,j+1)
curr.pop()
    ans=[]
    backtrack([],0)
    return ans

```

## Combinations

Our base case is if our current list is of length k

If its of length k we simply add it to the ans

In our recursive case, we explore all numbers from 1 to n, using an iterator variable j, and calling the function with arguments i+1 to move onto the next number

- class Solution:
def combine(self, n: int, k: int) -> List[List[int]]:
def backtrack(curr,i):
if len(curr)==k:
ans.append(curr[:])
return curr
for j in range(i,n+1):
curr.append(j)
backtrack(curr,j+1)
curr.pop()
- ans=[]
backtrack([],1)
return ans

## Letter Combination of a phone number

Create a dict of all numbers and their corresponding letters

Firstly we check if its a single digit, this is our base case, return dc[digit]

In the recursive case we PERMUTE each element of the current numbers list with the next numbers list to get all the options

![image.png](attachment:e498ea84-24c1-4634-aaec-fad56bdb9508:image.png)

## Generate Parenthesis

Intuition 

We are asked to generate all **valid combinations** of n pairs of parenthesis

A valid parenthesis string must satisfy the following 3 conditions

1. The number of opening brackets cannot exceed n
2. The number of closing cannot exceed the number of opening **already placed**
3. Total length of the parenthesis string must be `2n` 

### Important point

We only generate **VALID** strings rather than generating all strings then filtering

### Base Case

The string generated so far is of length `2n`  i.e Number of opening brackets = Number of closing brackets = `n`  

In this scenario we add the string to the final answer

### Recursive Case

At each step we have 2 choices, add Opening  if number of opening brackets is less than n and Closing number of closing brackets is less than number of opening brackets `already placed` (This ensures we never exceed `n` opening brackets and we never close more brackets than opened)

### Core idea

Each backtracking recursive call represents 2 choices

1. Opening bracket added
2. Closing bracket added

### Code

```python
class Solution:
    def generateParenthesis(self, n: int) -> List[str]:
        ans=[]
        def backtrack(path,opening,closing):
            if len(path)==2*n:
                ans.append(''.join(path[:]))
                return
            if opening<n:
                path.append('(')
                backtrack(path,opening+1,closing)
                path.pop()
            if closing<opening:
                path.append(')')
                backtrack(path,opening,closing+1)
                path.pop()
        backtrack([],0,0)
        return ans
```

### Time Complexity

$O(4^n/sqrt(n))$ - the $n^th$ catalan number 

# Combination Sum

Intuition

We are asked to generate all unique combinations of `candidates` where all the chosen numbers sum up to the `target`  

A valid list output must be:

1. The frequency of all `elements` of `candidates` must be different - Ensuring a unique output
2. The sum of **each** `candidate` in the `candidates` list must be equal to `target` 

Constraints

1. All elements of candidates are unique
2. An element may be chosen any number of times
3. No 2 candidate solutions can be the same eg [1.2,2] and [2,1,2] for target =5 cannot both be included

### Important Note

We only generate VALID solutions

### Base Case

The sum of the currently selected elements is equal to target 

We add this to our solutions list

In cases where we have iterated through the whole list and we have not yet reached the `target` , we return an empty list, i.e. this branch has 0 valid solutions eg [2], target =1 → [] output 

### Recursive Case

We have 2 options, either select the current element or don’t select the current element and move on to the next element.

In cases where our `current sum + current number` is greater than the `target`, we don’t select the `current number` and move on

In cases where our `current sum+ current number` is less than the `target` we may or may not select the current number 

## Code Explanation

```
class Solution:
    def combinationSum(self, candidates: List[int], target: int) -> List[List[int]]:
        ans=[]
   
        def backtrack(path,pos,curr):
            if curr==target:
                ans.append(path[:])
                return
            for i in range(pos,len(candidates)):
                if curr+candidates[i]<=target:
                    path.append(candidates[i])
                    backtrack(path,i,curr+candidates[i])
                    path.pop()
        backtrack([],0,0)
        return ans
```

This code works by creating a helper function called backtrack

The path is the currently selected numbers eg 2,3,4 - is our path as we have chosen 2,3,4 

We initially start with an empty path as we haven’t selected any numbers yet.

Pos is the current position, we use this to keep track of the currently selected number.

Curr is the current sum so far eg we have selected 2,3 curr is 5
In the Backtrack function 

We first check the base case, is our sum equal to target

If yes we add the current path to the ans we use `path[:]` to create a copy of the entire list 

Now we come to the recursive case

As our starting point is empty we can select any number as the first number eg [2,3,6,7], 

as our initial pos is 0 we start with 2

as curr =0, 0+2=2 , 2<7, we select 2

our path is now [2]

we backtrack, that is backtrack([2],0,2] → this continues till we find either a valid solution reaching if curr==target or we curr > target where the branch is pruned

when this full backtracking is completed, we remove 2 from the path and move on to 3 in the next call, as we finisehd an entire backtracking series i.e. all solutions starting from 2, this for loop iteration with i = 1, curr=3  has its own different set of recurisve calls

This continues for all numbers in the list

in the end we are left with all the correct solutions

The if in the for loop ensures we only explore valid branches, and the base case check ensures we stop when we find a solution,

# Numbers With the Same Consecutive Difference

Intuition

We want to generate any VALID `n` digit number where the difference between any 2 consecutive digits is `k`  

A valid solution must be:

1. `n`  digit eg n=3, `181`
2. Each consecutive digit must have an absolute difference of `k` , eg $n=2, k=1$ 10 → 1-0 = 1

### Important Note

We generate only solutions which are valid

### Base Case

IF the current solution is of length n we add it to our answer

if k=0, we generate all digits 1-9 k times eg k2, [11,22,33,44,55,66,77,88,99]

### Recursive Case

If our previous digit+k≤9 or previous digit-k≥0 and the digit being unique, we call recursively until the base case is reached

where each digit between 1 to 9 gets to be the starting digit - we use a forloop to get the first digit and call the backtrack function to get the following digits

Code

```python
class Solution:
    def numsSameConsecDiff(self, n: int, k: int) -> List[int]:
        ans=[]
        if k==0:
            return [int(str(i)*n) for i in range(1,10)]
        def backtrack(curr):
            if len(curr)==n:
                ans.append(int(curr))
                return
            upper=int(curr[-1])+k
            lower=int(curr[-1])-k
            if upper<=9:
                backtrack(curr+str(upper))
            if lower>=0:
                backtrack(curr+str(lower))
        for i in range(1,10):
            backtrack(str(i))
        return ans
```

The idea is the same as the explanation

WE first start with the base cases 

if `k` is 0 then we just want `n` digit numbers from 1 to 9 eg $n=3,k=0$ - ans would be `[111,222,333,444,555,666,777,888,999]` this is done efficiently via a list comphrension 

Coming to the backtrack function

We check the base case, as we are only generating VALID strings, we check if the current string is of length `n` i.e. a `n` digit number. We use `int(curr)`  as the output is a  `List of ints`  and we are working with strings.

Now to explore possible paths we calculate `upper` and `lower` 

`If upper<=9` we explore the path of the current string + upper

`if lower ≥0` we explore the path of current string + lower

The reason we check for both is in many cases eg n=3,k=1 we can get 121 or 101 which are both correct, so we check both upper and  lower

Now the special case is getting the first digit, as our backtracking function NEEDS a string with at least one digit we start by calling it with one string and exploring. Only valid strings are added to answer.

Now that we are sure that we got all possible valid strings we return `ans` .

### Time Complexity

Worst Case

$O(2^n)$ as we have a maximum 2 calls for each  backtrack call upper and lower, the worst case is exponential of $2^n$ , it stays this as our for loop runs 9 times regardless of the input so the complexity of just the for loop is $O(1)$

0 Case

In cases where k=0 time complexity is $O(n^2)$ as the list comp always generates 9 elements

While the forloop runs a fixed number of times, 9 times, we need to generate a string of length `n` which has a time complexity of $O(n)$ and convert it to int which also as a time complexity of $O(n)$ thus resulting in $O(n^2)$ as strings are immutable

## Combination Sum II

### Intuition

We are asked to return a list of lists of ints, which all sum up to a target

Constraints

1. Each candidate solution must be unique
2. Each number in the input may only be used 0 or 1 times

### Important Point

We only generate solutions which are valid in the first place, i.e use each input element only once, sum up to target, and have no duplicates

### Base Case

As we are only generating valid solutions our base case would be

If curr==Target

### Recursive Case

`candidates = [10,1,2,7,6,1,5], target = 8`

We can either select a number or not select it

If $curr+nums[i]≤Target$ we will select the number

### Core Idea

Select a digit only if

1. $Curr+ nums[i] ≤ Target$
2. We have explored it before - for duplicates, if we have selected the first one eg selected the first `1`  we wont start a backtracking call from the second one, this ensures we don’t miss out on solutions with both `1,1` and only generate UNIQUE solutions
3. We only select a digit once thus i+1
4. After selecting a digit we only select digits after it thus forloop starting from `pos`

### Code

```python
class Solution:
    def combinationSum2(self, candidates: List[int], target: int) -> List[List[int]]:
        ans=[]
        candidates.sort()
        print(candidates)
        def backtrack(path,pos,curr):
            if curr==target:
                ans.append(path[:])
                return
            for i in range(pos,len(candidates)):
                if i>pos and candidates[i]==candidates[i-1]:
                    continue
                next=curr+candidates[i]
                if next<=target:
                    path.append(candidates[i])
                    backtrack(path,i+1,next)
                    path.pop()
        backtrack([],0,0)
        return ans
```

This problem has duplicates in the input

But we also dont want duplicate solutions

The first step in combating this is to sort the array

Backtracking

WE first check the base case

If we are at the target we create a copy of our current `path` and append it to the `ans` 

Now on the recursive Case

We start by checking if we can select each number - the reason we have pos is that if we have selected a number we can only select numbers after that number eg [1, 1, 2, 5, 6, 7, 10] we are at pos=3, value=2, we can now only select any values with an index > 3, thus we do 2 things

In the next back tracking call we start with i+1 

In the next loop iteration we start with the next index only

The reason we do this and also pop after the backtracking call is to explore both possibilities of including and exlcuding the number

The reason we have this line `if i>pos and candidates[i]==candidates[i-1]` is to prevent duplicates, eg you have already selected the first one and started backtracking calls from it, you can select the 2nd one as `*i` will be less than `pos`* but if we dont select 1 and select the 2nd one, we prevent this as `i>pos`

We then return the ans

### Time Complexity

Sorting - $O(n*log(n))$ we use pythons built in sort function which uses timesort

Now coming to the `Backtrack` Functions

The for loop iterates n times having a time complexity by itself of $O(n)$

Because for each value we have 2 backtrack calls as worst case i.e. selecting or not selecting it the time complexity is $O(2^n)$

The pop time complexity is $O(1)$ 

The append time complexity is $O(n)$ as `[:]` creates a copy of the list

The overall time complexity is $O(n*2^n)$ as its the greatest degree 

## Combinations 2

### Intuition

We need to generate a list of lists of ints, where each list is of length `k`  and sums up to `n` 

### Constraints

1. Each solution must be unique
2. We can only use numbers 1,9
3. Each number may only be used once or not at all

### Base Case

If the length of `path` is `k` and current sum `curr` is `n` , we append and return

### Recursive Case

If the current sum is less than n and the length of the path after adding the next digit is less than k

We append the current number to the path

we call the function only using the next number onwards 

### Core idea

Select a digit only if $curr+i<=n and len(path)<k$

### Code

```python
class Solution:
    def combinationSum3(self, k: int, n: int) -> List[List[int]]:
        ans=[]
        def backtrack(path,pos,curr):
            if curr==n and len(path)==k:
                ans.append(path[:])
                return
            for i in range(pos,10):
                if curr+i<=n and len(path)<k:
                    path.append(i)
                    backtrack(path,i+1,curr+i)
                    path.pop()
        backtrack([],1,0)
        return ans
```

##