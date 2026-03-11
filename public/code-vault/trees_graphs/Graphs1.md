## Surrounded Regions

https://leetcode.com/problems/surrounded-regions/

### Intuition

We need to change regions of ‘O’ to regions of ‘X’ if they are valid. To be valid the ‘O’s cannot have any adjecent ‘O’s in the edge, eg if you connect the Os and reach an edge, you ignore them, else you change them to ‘X’, 

### Steps

1. Find all zeros at edges
2. Change the edge zeros and their adjacent zeros (Chain) to `#` using $BFS$
3. Change any remaining zeros to `X`
4. Change the `#` back to `O`

### Important Point

Keeping Track of Adjacent Zeros from edges. Once you have dealt with them, you only need to change any remaining zeros

### Code

```python
class Solution:
    def solve(self, board: List[List[str]]) -> None:
        """
        Do not return anything, modify board in-place instead.
        """
        def bfsEdge(i,j):
            queue=[]
            queue.append([i,j])
            neigh=[[0,1],[1,0],[-1,0],[0,-1]]
            board[i][j]='#'
            while queue:
                size=len(queue)
                for num in range(size):
                    i,j=queue[0]
                    queue.pop(0)
                    for v in neigh:
                        newi=i+v[0]
                        newj=j+v[1]
                        if 0<=newi<len(board) and 0<=newj<len(board[0]) and board[newi][newj]=='O':
                            board[newi][newj]='#'
                            queue.append([newi,newj])
            return
        for i in range(0,len(board)):
            for j in range(0,len(board[0])):
                if (i==0 or i==len(board)-1 or j==0 or j==len(board[0])-1) and board[i][j]=='O':
                    #print([i,j],board[i][j])
                    bfsEdge(i,j)
        for i in range(len(board)):
            for j in range(len(board[0])):
                if board[i][j]=='O':
                    board[i][j]='X'
                if board[i][j]=='#':
                    board[i][j]='O'
              
        return 
```

### Time Complexity

## Clone Graph

https://leetcode.com/problems/clone-graph/description/

### Intuition

We need to return a deep copy of the graph

### Core Idea

Perform  BFS on the old graph to reconstruct the new one

1. Start at the starting node
2. Append it to the queue
3. Now we explore the queue `while queue` 
4. As it is FIFO
    1. We explore the first element `curr=queue[0]` 
    2. We pop it 
    3. We then visit its neighbors
5. If a neighbor is not visited:
    1. We create a new node for our new list and store it in the dict `dc[curr]=newNode` 
6. If a node is visited

### Code

## Word Ladder

https://leetcode.com/problems/word-ladder/

## Word Search

https://leetcode.com/problems/word-search/description/

### Intuition

We are given a 2d array, we need to check if a given word exists in said array. A word exists if at any starting point eg word is ‘ABB’ if at any point we start from ‘A’ in the grid, and join adjacent cells i.e. cells immediately next to ‘A’ until we reach the last ‘B’ the word exists, else it doesnt.

### Core Idea

1. You perform a BFS on the grid
2. At each cell, you check first look for the first character of the word eg `A`
3. Once you have found the firs character, you then check all its neighbors for the 2nd character, and so on until you reach the final character 
4. If at any point none of the neighbors of the current letter contain the next letter, we end the search and return false

| A | C | D | A |
| --- | --- | --- | --- |
| S | F | C | B |
| D | E | C | C |

### Problems Encountered

When we have 2 viable neighbors, we need to search both, to do so we will implement backtracking.

### Search Logic

Intuition: We need to find the next valid value. A value is only valid if it matches the next letter of our target word

Note: We only generate valid valies i.e. if the neighbors dont contain the next letter we dont consider them

Base cases:

 `if not queue` returns something…? → This branch should be discarded, as we have explored all neighbors starting from this branch and it lead us nowhere

`if nextIndex==len(word)` this is success, as we have found a valid path from start to end covering all letters return `True`

Recursive Case:

If the neighbor is valid, we make a new recursive call → add the neighbor to the end of the queue, increment the value of `nextIndex` by 1.

Do this in a loop to explore all viable neighbors.

You return true if ATLEAST one branch is True else False