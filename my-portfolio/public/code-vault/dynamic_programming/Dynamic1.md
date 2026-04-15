# Dynamic Programming
## What is dynamic programming?

Dynamic Programming is one of the most feared topics in DSA, after encountering a few problems in interviews and OA’s myself, it did seem scary to me too. However, after months of consistent DSA practice, understanding concepts such as `Recursion` , `Backtracking` , `Trees` lead me to get a deeper appreciation and understanding of the elegance of small, simple `Optimizations` , on `Time Complexities` , while time complexities seem like an abstract thing to understand, my mentor helped me quantify it by executing, but not running un prepared, that is the mistake i made when giving my initial round of interviews and OA’s, by executing, we started with a small problem, for instance finding the Fibonacci sequence till a number `n` , we would start by mapping the basic logic, only after that is clear, we would proceed to write the code, but we still didn’t execute, instead we followed a dry run on paper, and a tree diagram. 

## What dry runs taught me…

DSA isn’t a coding test, its a logical thinking test, the code is the easy part, the real challenge lies in 2 areas:

1. Understanding the ask of the problem
    1. When we started DSA progress was slow, but one of the most important skills i learnt was developing an `*intuition`* about the problem. What is it that the interviewer or the problem is actually looking to solve?
    2. The first part, what is the input eg in our Fibonacci series example our input is an integer `n` .
    3. The second part is, what does the function return, in many cases some of my recursive cases would return a `list` while others would return a **`boolean` , this made no sense.**
        1. Now after slowing down, understanding what’s asked of the problem, we can identify what is the output, eg for the Fibonacci problem our output is also an `integer` , which is the sequence’s value at `n` 
    4. Now that we know what’s the input and what's the output, we only need to understand the `Constraints` we are working with.
        1. In some problems its obvious eg the size of the input
        2. In some problems its a clue eg Recursion problems are often limited to smaller numbers due to the exponential Time Complexity
        3. In some problems, phrasing the constraints correctly can be the difference between a blank slate and a proper intuition. Eg for permutation problems or problems where our output is based on a subset of inputs, the problem often states ‘you may use each element at most once’ or ‘a[i],a[j] where i≠j’, while these terms are often vague and ambiguous to beginners, I now realize we can rephrase them to make solving the problem alot easier:
            1. It is easier to understand how to prevent duplicates when we understand that we can only select each element once
2. Understanding what processing to apply to the input to get the output
    1. Once we have developed the intuition, we really get to solving the real problem the `Logic` 
    2. In many cases the intuition is half the battle one
    3. In some we need to do more
    4. Some of the most difficult problems ive encountered aren’t backtracking problems but simple 2 pointer or sliding window problems
        1. How do i select 2 numbers from a list without sorting to get the maximum difference for example?
        2. But here is where the real elegance of DSA’s constraint understanding lies
            1. The problem i referred to is one where we are given the stock price each day, it is obvious that if you buy a stock on Monday, you can only sell it in the future.
            2. What this means is that you cannot sort the list so the obvious solution of ‘*I’ll just find the minimum and maximum and subtract’*  wont work.
            3. Instead after hours of thinking i realized that, what the problem really asked is *‘If i sell today what is the best i can do?’*
            4. So instead of worrying about sorting or dictionaries, i simply made a list of the maximum future stock at each index or day, and updated `ans=max(ans,maxFuture[i]-prices[i])` 

## How did this help me with DP?

Recursion taught me how to break down a big problem into smaller sub problems. Constrained problems such as finding elements from a list in $O(n)$ time or returning a list with certain operations in $O(1)$ constant space, taught me optimization. Hash map problems, DFS and BFS, taught me how to efficiently store repeated or useful values. Now that i had followed this guided path, with months of not feeling progress, weeks with only 1-3 problems solved, days where i couldn't do my daily target, this slow, consistent, methodic approach finally, helped me pick up speed in most areas of DSA, do a variety of leetcode problems and most importantly, help me understand DP, and the biggest personal lesson. *‘The best solution is often the simplest’*., this taught me to accept that $O(n^2)$ is the best time complexity for problems such as `3sum` and that simple operations, lead the best time complexities and results.