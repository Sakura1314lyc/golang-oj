package seed

import (
	"log"
	"time"

	"golang-oj/database"
	"golang-oj/models"

	"golang.org/x/crypto/bcrypt"
)

func All() {
	seedUsers()
	seedProblems()
	seedContests()
	log.Println("Seed data created successfully")
}

func seedUsers() {
	var count int64
	database.DB.Model(&models.User{}).Count(&count)
	if count > 0 {
		return
	}
	pass, _ := bcrypt.GenerateFromPassword([]byte("123456"), bcrypt.DefaultCost)
	users := []models.User{
		{Username: "admin", Password: string(pass), Rating: 1500, SolvedCount: 10, SubmitCount: 30, AcceptedCount: 25},
		{Username: "Alice", Password: string(pass), Rating: 1350, SolvedCount: 8, SubmitCount: 20, AcceptedCount: 15},
		{Username: "Bob", Password: string(pass), Rating: 1200, SolvedCount: 5, SubmitCount: 18, AcceptedCount: 10},
		{Username: "Charlie", Password: string(pass), Rating: 1100, SolvedCount: 3, SubmitCount: 12, AcceptedCount: 6},
	}
	for _, u := range users {
		database.DB.Create(&u)
	}
}

func seedProblems() {
	var count int64
	database.DB.Model(&models.Problem{}).Count(&count)
	if count > 0 {
		return
	}

	problems := []models.Problem{
		{
			ID: 1001, Title: "A + B Problem",
			Description: "输入两个整数 a 和 b，输出它们的和。",
			InputDesc:   "一行，两个整数 a 和 b，以空格分隔。（-10^9 ≤ a, b ≤ 10^9）",
			OutputDesc:  "输出 a + b 的结果。",
			Tags:        "数学,入门", Difficulty: "Easy", TimeLimitMS: 1000, MemoryLimit: 128,
		},
		{
			ID: 1002, Title: "反转字符串",
			Description: "输入一个字符串，输出反转后的结果。",
			InputDesc:   "一行，一个字符串 s。（1 ≤ |s| ≤ 1000）",
			OutputDesc:  "输出反转后的字符串。",
			Tags:        "字符串,入门", Difficulty: "Easy", TimeLimitMS: 1000, MemoryLimit: 128,
		},
		{
			ID: 1003, Title: "两数之和",
			Description: "给定一个整数数组和一个目标值，找出数组中和为目标值的两个数的下标（从 0 开始）。假设每种输入只对应一个答案。",
			InputDesc:   "第一行一个整数 n（2 ≤ n ≤ 10^4）。第二行 n 个整数。第三行一个整数 target。",
			OutputDesc:  "输出两个下标，空格分隔。",
			Tags:        "数组,哈希表", Difficulty: "Easy", TimeLimitMS: 1000, MemoryLimit: 128,
		},
		{
			ID: 1004, Title: "回文数判断",
			Description: "判断一个整数是否是回文数。回文数是指正序和倒序读都是一样的整数。",
			InputDesc:   "一行，一个整数 x。（-2^31 ≤ x ≤ 2^31-1）",
			OutputDesc:  "输出 true 或 false。",
			Tags:        "数学,入门", Difficulty: "Easy", TimeLimitMS: 1000, MemoryLimit: 128,
		},
		{
			ID: 1005, Title: "最大子数组和",
			Description: "给定一个整数数组，找出一个具有最大和的连续子数组，返回其最大和。",
			InputDesc:   "第一行一个整数 n（1 ≤ n ≤ 10^5）。第二行 n 个整数。",
			OutputDesc:  "输出最大子数组的和。",
			Tags:        "数组,动态规划", Difficulty: "Medium", TimeLimitMS: 1000, MemoryLimit: 128,
		},
		{
			ID: 1006, Title: "斐波那契数列",
			Description: "求斐波那契数列的第 n 项。F(1) = 1, F(2) = 1, F(n) = F(n-1) + F(n-2)。",
			InputDesc:   "一行，一个整数 n（1 ≤ n ≤ 45）。",
			OutputDesc:  "输出第 n 项的值。",
			Tags:        "递归,动态规划", Difficulty: "Easy", TimeLimitMS: 1000, MemoryLimit: 128,
		},
		{
			ID: 1007, Title: "素数判断",
			Description: "判断一个正整数是否为素数（质数）。",
			InputDesc:   "一行，一个整数 n（2 ≤ n ≤ 10^6）。",
			OutputDesc:  "如果是素数输出 yes，否则输出 no。",
			Tags:        "数学,入门", Difficulty: "Easy", TimeLimitMS: 1000, MemoryLimit: 128,
		},
		{
			ID: 1008, Title: "二分查找",
			Description: "给定一个升序排列的整数数组和一个目标值，返回目标值的下标（从 0 开始）。如果不存在，输出 -1。",
			InputDesc:   "第一行两个整数 n 和 target（1 ≤ n ≤ 10^5）。第二行 n 个升序排列的整数。",
			OutputDesc:  "输出目标值的下标，或 -1。",
			Tags:        "二分查找,数组", Difficulty: "Easy", TimeLimitMS: 1000, MemoryLimit: 128,
		},
		{
			ID: 1009, Title: "括号匹配",
			Description: "给定一个只包含 '('、')'、'{'、'}'、'['、']' 的字符串，判断字符串是否有效。有效括号需满足左括号必须用相同类型的右括号闭合且顺序正确。",
			InputDesc:   "一行，一个括号字符串 s（1 ≤ |s| ≤ 10^4）。",
			OutputDesc:  "输出 true 或 false。",
			Tags:        "栈,字符串", Difficulty: "Easy", TimeLimitMS: 1000, MemoryLimit: 128,
		},
		{
			ID: 1010, Title: "删除排序数组中的重复项",
			Description: "给定一个升序排列的数组，删除重复出现的元素，使每个元素只出现一次。输出删除后数组的长度。",
			InputDesc:   "第一行一个整数 n（1 ≤ n ≤ 10^4）。第二行 n 个升序排列的整数。",
			OutputDesc:  "输出去重后的长度。",
			Tags:        "数组,双指针", Difficulty: "Easy", TimeLimitMS: 1000, MemoryLimit: 128,
		},
		{
			ID: 1011, Title: "最长公共前缀",
			Description: "给定多个字符串，找出它们的最长公共前缀。如果没有公共前缀，输出空行。",
			InputDesc:   "第一行一个整数 n（1 ≤ n ≤ 200）。接下来 n 行，每行一个字符串。",
			OutputDesc:  "输出最长公共前缀。",
			Tags:        "字符串,入门", Difficulty: "Easy", TimeLimitMS: 1000, MemoryLimit: 128,
		},
		{
			ID: 1012, Title: "爬楼梯",
			Description: "假设你正在爬楼梯，需要 n 步才能到达顶部。每次你可以爬 1 或 2 个台阶。有多少种不同的方法爬到顶部？",
			InputDesc:   "一行，一个整数 n（1 ≤ n ≤ 45）。",
			OutputDesc:  "输出爬到顶部的方法数。",
			Tags:        "动态规划,入门", Difficulty: "Easy", TimeLimitMS: 1000, MemoryLimit: 128,
		},
		{
			ID: 1013, Title: "只出现一次的数字",
			Description: "给定一个非空整数数组，除了某个元素只出现一次以外，其余每个元素均出现两次。找出那个只出现了一次的元素。",
			InputDesc:   "第一行一个整数 n（1 ≤ n ≤ 10^5）。第二行 n 个整数。",
			OutputDesc:  "输出只出现一次的那个数。",
			Tags:        "位运算,数组", Difficulty: "Easy", TimeLimitMS: 1000, MemoryLimit: 128,
		},
		{
			ID: 1014, Title: "移动零",
			Description: "给定一个数组，将所有的 0 移动到数组的末尾，同时保持非零元素的相对顺序。输出移动后的数组。",
			InputDesc:   "第一行一个整数 n（1 ≤ n ≤ 10^4）。第二行 n 个整数。",
			OutputDesc:  "输出移动 0 之后的数组，数字间用空格分隔。",
			Tags:        "数组,双指针", Difficulty: "Easy", TimeLimitMS: 1000, MemoryLimit: 128,
		},
		{
			ID: 1015, Title: "存在重复元素",
			Description: "给定一个整数数组，判断是否存在重复元素。如果存在任一值在数组中出现至少两次，输出 true，否则输出 false。",
			InputDesc:   "第一行一个整数 n（1 ≤ n ≤ 10^5）。第二行 n 个整数。",
			OutputDesc:  "输出 true 或 false。",
			Tags:        "数组,哈希表", Difficulty: "Easy", TimeLimitMS: 1000, MemoryLimit: 128,
		},
		{
			ID: 1016, Title: "缺失的数字",
			Description: "给定一个包含 [0, n] 中 n 个数的数组，找出缺失的那个数。",
			InputDesc:   "第一行一个整数 n（1 ≤ n ≤ 10^4）。第二行 n 个整数，范围 0~n 且不重复。",
			OutputDesc:  "输出缺失的那个数。",
			Tags:        "数组,位运算", Difficulty: "Easy", TimeLimitMS: 1000, MemoryLimit: 128,
		},
		{
			ID: 1017, Title: "2 的幂",
			Description: "给定一个整数 n，判断它是否是 2 的幂次方。",
			InputDesc:   "一行，一个整数 n（-2^31 ≤ n ≤ 2^31-1）。",
			OutputDesc:  "如果是 2 的幂输出 true，否则输出 false。",
			Tags:        "位运算,数学", Difficulty: "Easy", TimeLimitMS: 1000, MemoryLimit: 128,
		},
		{
			ID: 1018, Title: "阶乘",
			Description: "给定一个正整数 n，求 n!（n 的阶乘）。",
			InputDesc:   "一行，一个整数 n（1 ≤ n ≤ 20）。",
			OutputDesc:  "输出 n! 的值。",
			Tags:        "数学,入门", Difficulty: "Easy", TimeLimitMS: 1000, MemoryLimit: 128,
		},
		{
			ID: 1019, Title: "合并有序数组",
			Description: "给定两个升序排列的整数数组，将它们合并为一个升序数组。",
			InputDesc:   "第一行两个整数 n 和 m（1 ≤ n,m ≤ 10^4）。第二行 n 个升序整数。第三行 m 个升序整数。",
			OutputDesc:  "输出合并后的升序数组，数字间用空格分隔。",
			Tags:        "数组,双指针", Difficulty: "Easy", TimeLimitMS: 1000, MemoryLimit: 128,
		},
		{
			ID: 1020, Title: "加一",
			Description: "给定一个由整数组成的非空数组所表示的非负整数，在该数的基础上加一。数组每个元素只存储单个数字。",
			InputDesc:   "第一行一个整数 n（1 ≤ n ≤ 100）。第二行 n 个整数（0-9）。",
			OutputDesc:  "输出加一后的数组，数字间用空格分隔。",
			Tags:        "数组,数学", Difficulty: "Easy", TimeLimitMS: 1000, MemoryLimit: 128,
		},
		{
			ID: 1021, Title: "快乐数",
			Description: "快乐数定义为：对于一个正整数，每一次将该数替换为它每个位置上的数字的平方和，然后重复这个过程直到变为 1，或者进入无限循环。如果能变为 1，则是快乐数。",
			InputDesc:   "一行，一个整数 n（1 ≤ n ≤ 2^31-1）。",
			OutputDesc:  "如果是快乐数输出 true，否则输出 false。",
			Tags:        "数学,哈希表", Difficulty: "Easy", TimeLimitMS: 1000, MemoryLimit: 128,
		},
		{
			ID: 1022, Title: "计数质数",
			Description: "统计所有小于非负整数 n 的质数的数量。",
			InputDesc:   "一行，一个整数 n（2 ≤ n ≤ 10^6）。",
			OutputDesc:  "输出小于 n 的质数个数。",
			Tags:        "数学,筛法", Difficulty: "Medium", TimeLimitMS: 2000, MemoryLimit: 256,
		},
		{
			ID: 1023, Title: "最大公约数和最小公倍数",
			Description: "输入两个正整数，输出它们的最大公约数和最小公倍数。",
			InputDesc:   "一行，两个整数 a 和 b（1 ≤ a,b ≤ 10^6）。",
			OutputDesc:  "输出 gcd 和 lcm，空格分隔。",
			Tags:        "数学,入门", Difficulty: "Easy", TimeLimitMS: 1000, MemoryLimit: 128,
		},
		{
			ID: 1024, Title: "数组的最大乘积",
			Description: "给定一个整数数组，找出数组中两个不同位置元素的最大乘积。",
			InputDesc:   "第一行一个整数 n（2 ≤ n ≤ 10^4）。第二行 n 个整数。",
			OutputDesc:  "输出最大乘积。",
			Tags:        "数组,入门", Difficulty: "Easy", TimeLimitMS: 1000, MemoryLimit: 128,
		},
		{
			ID: 1025, Title: "有效的字母异位词",
			Description: "给定两个字符串，判断它们是否是字母异位词（字母相同但顺序不同）。",
			InputDesc:   "两行，每行一个字符串 s 和 t（1 ≤ |s|,|t| ≤ 10^4）。",
			OutputDesc:  "如果是字母异位词输出 true，否则输出 false。",
			Tags:        "字符串,哈希表", Difficulty: "Easy", TimeLimitMS: 1000, MemoryLimit: 128,
		},
		{
			ID: 1026, Title: "排序数组",
			Description: "给定一个整数数组，将其按升序排列后输出。",
			InputDesc:   "第一行一个整数 n（1 ≤ n ≤ 10^5）。第二行 n 个整数。",
			OutputDesc:  "输出升序排列后的数组，数字间用空格分隔。",
			Tags:        "排序,数组", Difficulty: "Easy", TimeLimitMS: 1000, MemoryLimit: 128,
		},
		{
			ID: 1027, Title: "验证回文串",
			Description: "给定一个字符串，只考虑字母和数字字符，忽略大小写，判断它是否是回文串。",
			InputDesc:   "一行，一个字符串 s（1 ≤ |s| ≤ 10^5），可能包含空格和标点。",
			OutputDesc:  "如果是回文串输出 true，否则输出 false。",
			Tags:        "字符串,双指针", Difficulty: "Easy", TimeLimitMS: 1000, MemoryLimit: 128,
		},
		{
			ID: 1028, Title: "买股票的最佳时机",
			Description: "给定一个数组，第 i 个元素是第 i 天的股票价格。只能买卖一次，求最大利润。",
			InputDesc:   "第一行一个整数 n（2 ≤ n ≤ 10^5）。第二行 n 个整数表示价格。",
			OutputDesc:  "输出最大利润（如果无法获利，输出 0）。",
			Tags:        "数组,动态规划", Difficulty: "Medium", TimeLimitMS: 1000, MemoryLimit: 128,
		},
	}

	for _, p := range problems {
		database.DB.Create(&p)
	}

	seedTestCases()
}

func seedTestCases() {
	var count int64
	database.DB.Model(&models.TestCase{}).Count(&count)
	if count > 0 {
		return
	}

	cases := []models.TestCase{
		// 1001 - A+B
		{ProblemID: 1001, Input: "1 2\n", Output: "3", IsSample: true},
		{ProblemID: 1001, Input: "100 250\n", Output: "350", IsSample: true},
		{ProblemID: 1001, Input: "-5 10\n", Output: "5", IsSample: false},
		{ProblemID: 1001, Input: "999 1\n", Output: "1000", IsSample: false},
		{ProblemID: 1001, Input: "0 0\n", Output: "0", IsSample: false},
		// 1002 - Reverse String
		{ProblemID: 1002, Input: "hello\n", Output: "olleh", IsSample: true},
		{ProblemID: 1002, Input: "GOOJ\n", Output: "JOOG", IsSample: true},
		{ProblemID: 1002, Input: "a\n", Output: "a", IsSample: false},
		{ProblemID: 1002, Input: "12345\n", Output: "54321", IsSample: false},
		{ProblemID: 1002, Input: "racecar\n", Output: "racecar", IsSample: false},
		// 1003 - Two Sum
		{ProblemID: 1003, Input: "4\n2 7 11 15\n9\n", Output: "0 1", IsSample: true},
		{ProblemID: 1003, Input: "3\n3 2 4\n6\n", Output: "1 2", IsSample: true},
		{ProblemID: 1003, Input: "2\n3 3\n6\n", Output: "0 1", IsSample: false},
		{ProblemID: 1003, Input: "5\n1 5 3 7 9\n12\n", Output: "1 3", IsSample: false},
		// 1004 - Palindrome Number
		{ProblemID: 1004, Input: "121\n", Output: "true", IsSample: true},
		{ProblemID: 1004, Input: "-121\n", Output: "false", IsSample: true},
		{ProblemID: 1004, Input: "10\n", Output: "false", IsSample: false},
		{ProblemID: 1004, Input: "0\n", Output: "true", IsSample: false},
		{ProblemID: 1004, Input: "12321\n", Output: "true", IsSample: false},
		// 1005 - Maximum Subarray
		{ProblemID: 1005, Input: "9\n-2 1 -3 4 -1 2 1 -5 4\n", Output: "6", IsSample: true},
		{ProblemID: 1005, Input: "1\n1\n", Output: "1", IsSample: true},
		{ProblemID: 1005, Input: "5\n5 4 -1 7 8\n", Output: "23", IsSample: false},
		{ProblemID: 1005, Input: "5\n-1 -2 -3 -4 -5\n", Output: "-1", IsSample: false},
		// 1006 - Fibonacci
		{ProblemID: 1006, Input: "1\n", Output: "1", IsSample: true},
		{ProblemID: 1006, Input: "5\n", Output: "5", IsSample: true},
		{ProblemID: 1006, Input: "10\n", Output: "55", IsSample: false},
		{ProblemID: 1006, Input: "20\n", Output: "6765", IsSample: false},
		{ProblemID: 1006, Input: "30\n", Output: "832040", IsSample: false},
		// 1007 - Prime Check
		{ProblemID: 1007, Input: "7\n", Output: "yes", IsSample: true},
		{ProblemID: 1007, Input: "12\n", Output: "no", IsSample: true},
		{ProblemID: 1007, Input: "2\n", Output: "yes", IsSample: false},
		{ProblemID: 1007, Input: "97\n", Output: "yes", IsSample: false},
		{ProblemID: 1007, Input: "100\n", Output: "no", IsSample: false},
		// 1008 - Binary Search
		{ProblemID: 1008, Input: "5 3\n1 2 3 4 5\n", Output: "2", IsSample: true},
		{ProblemID: 1008, Input: "4 5\n1 3 5 7\n", Output: "2", IsSample: true},
		{ProblemID: 1008, Input: "4 8\n1 3 5 7\n", Output: "-1", IsSample: false},
		{ProblemID: 1008, Input: "1 1\n1\n", Output: "0", IsSample: false},
		{ProblemID: 1008, Input: "6 10\n1 3 5 7 9 11\n", Output: "-1", IsSample: false},
		// 1009 - Valid Parentheses
		{ProblemID: 1009, Input: "()\n", Output: "true", IsSample: true},
		{ProblemID: 1009, Input: "()[]{}\n", Output: "true", IsSample: true},
		{ProblemID: 1009, Input: "(]\n", Output: "false", IsSample: false},
		{ProblemID: 1009, Input: "([)]\n", Output: "false", IsSample: false},
		{ProblemID: 1009, Input: "{[]}\n", Output: "true", IsSample: false},
		// 1010 - Remove Duplicates
		{ProblemID: 1010, Input: "5\n1 1 2 2 3\n", Output: "3", IsSample: true},
		{ProblemID: 1010, Input: "3\n1 1 1\n", Output: "1", IsSample: true},
		{ProblemID: 1010, Input: "6\n1 2 3 4 5 6\n", Output: "6", IsSample: false},
		{ProblemID: 1010, Input: "8\n-5 -5 -3 -3 0 0 1 2\n", Output: "5", IsSample: false},
		// 1011 - Longest Common Prefix
		{ProblemID: 1011, Input: "3\nflower\nflow\nflight\n", Output: "fl", IsSample: true},
		{ProblemID: 1011, Input: "3\ndog\nracecar\ncar\n", Output: "", IsSample: true},
		{ProblemID: 1011, Input: "2\napple\napple\n", Output: "apple", IsSample: false},
		{ProblemID: 1011, Input: "2\ntest\ntester\n", Output: "test", IsSample: false},
		// 1012 - Climbing Stairs
		{ProblemID: 1012, Input: "2\n", Output: "2", IsSample: true},
		{ProblemID: 1012, Input: "3\n", Output: "3", IsSample: true},
		{ProblemID: 1012, Input: "5\n", Output: "8", IsSample: false},
		{ProblemID: 1012, Input: "10\n", Output: "89", IsSample: false},
		{ProblemID: 1012, Input: "20\n", Output: "10946", IsSample: false},
		// 1013 - Single Number
		{ProblemID: 1013, Input: "5\n2 2 1 1 3\n", Output: "3", IsSample: true},
		{ProblemID: 1013, Input: "3\n1 2 1\n", Output: "2", IsSample: true},
		{ProblemID: 1013, Input: "1\n5\n", Output: "5", IsSample: false},
		{ProblemID: 1013, Input: "7\n4 1 2 1 2 4 7\n", Output: "7", IsSample: false},
		// 1014 - Move Zeroes
		{ProblemID: 1014, Input: "5\n0 1 0 3 12\n", Output: "1 3 12 0 0", IsSample: true},
		{ProblemID: 1014, Input: "3\n0 0 1\n", Output: "1 0 0", IsSample: true},
		{ProblemID: 1014, Input: "4\n1 2 3 4\n", Output: "1 2 3 4", IsSample: false},
		{ProblemID: 1014, Input: "2\n0 0\n", Output: "0 0", IsSample: false},
		// 1015 - Contains Duplicate
		{ProblemID: 1015, Input: "4\n1 2 3 1\n", Output: "true", IsSample: true},
		{ProblemID: 1015, Input: "3\n1 2 3\n", Output: "false", IsSample: true},
		{ProblemID: 1015, Input: "5\n1 1 1 1 1\n", Output: "true", IsSample: false},
		{ProblemID: 1015, Input: "1\n1\n", Output: "false", IsSample: false},
		// 1016 - Missing Number
		{ProblemID: 1016, Input: "3\n3 0 1\n", Output: "2", IsSample: true},
		{ProblemID: 1016, Input: "2\n1 0\n", Output: "2", IsSample: false},
		{ProblemID: 1016, Input: "5\n0 1 2 3 4\n", Output: "5", IsSample: false},
		{ProblemID: 1016, Input: "4\n4 2 1 0\n", Output: "3", IsSample: false},
		// 1017 - Power of Two
		{ProblemID: 1017, Input: "1\n", Output: "true", IsSample: true},
		{ProblemID: 1017, Input: "16\n", Output: "true", IsSample: true},
		{ProblemID: 1017, Input: "18\n", Output: "false", IsSample: false},
		{ProblemID: 1017, Input: "0\n", Output: "false", IsSample: false},
		{ProblemID: 1017, Input: "2147483648\n", Output: "false", IsSample: false},
		// 1018 - Factorial
		{ProblemID: 1018, Input: "5\n", Output: "120", IsSample: true},
		{ProblemID: 1018, Input: "3\n", Output: "6", IsSample: true},
		{ProblemID: 1018, Input: "10\n", Output: "3628800", IsSample: false},
		{ProblemID: 1018, Input: "1\n", Output: "1", IsSample: false},
		{ProblemID: 1018, Input: "20\n", Output: "2432902008176640000", IsSample: false},
		// 1019 - Merge Sorted Array
		{ProblemID: 1019, Input: "3 3\n1 3 5\n2 4 6\n", Output: "1 2 3 4 5 6", IsSample: true},
		{ProblemID: 1019, Input: "2 2\n1 2\n3 4\n", Output: "1 2 3 4", IsSample: true},
		{ProblemID: 1019, Input: "1 1\n0\n1\n", Output: "0 1", IsSample: false},
		{ProblemID: 1019, Input: "3 1\n1 4 7\n2\n", Output: "1 2 4 7", IsSample: false},
		// 1020 - Plus One
		{ProblemID: 1020, Input: "3\n1 2 3\n", Output: "1 2 4", IsSample: true},
		{ProblemID: 1020, Input: "1\n9\n", Output: "1 0", IsSample: true},
		{ProblemID: 1020, Input: "3\n9 9 9\n", Output: "1 0 0 0", IsSample: false},
		{ProblemID: 1020, Input: "2\n4 9\n", Output: "5 0", IsSample: false},
		// 1021 - Happy Number
		{ProblemID: 1021, Input: "19\n", Output: "true", IsSample: true},
		{ProblemID: 1021, Input: "2\n", Output: "false", IsSample: true},
		{ProblemID: 1021, Input: "7\n", Output: "true", IsSample: false},
		{ProblemID: 1021, Input: "4\n", Output: "false", IsSample: false},
		// 1022 - Count Primes
		{ProblemID: 1022, Input: "10\n", Output: "4", IsSample: true},
		{ProblemID: 1022, Input: "20\n", Output: "8", IsSample: false},
		{ProblemID: 1022, Input: "2\n", Output: "0", IsSample: false},
		{ProblemID: 1022, Input: "100\n", Output: "25", IsSample: false},
		// 1023 - GCD and LCM
		{ProblemID: 1023, Input: "12 18\n", Output: "6 36", IsSample: true},
		{ProblemID: 1023, Input: "7 13\n", Output: "1 91", IsSample: true},
		{ProblemID: 1023, Input: "100 75\n", Output: "25 300", IsSample: false},
		{ProblemID: 1023, Input: "1 100\n", Output: "1 100", IsSample: false},
		// 1024 - Max Product
		{ProblemID: 1024, Input: "4\n3 4 5 2\n", Output: "20", IsSample: true},
		{ProblemID: 1024, Input: "2\n1 5\n", Output: "5", IsSample: false},
		{ProblemID: 1024, Input: "5\n-10 -20 1 2 3\n", Output: "200", IsSample: false},
		{ProblemID: 1024, Input: "3\n0 1 2\n", Output: "2", IsSample: false},
		// 1025 - Valid Anagram
		{ProblemID: 1025, Input: "anagram\nnagaram\n", Output: "true", IsSample: true},
		{ProblemID: 1025, Input: "rat\ncar\n", Output: "false", IsSample: true},
		{ProblemID: 1025, Input: "ab\nba\n", Output: "true", IsSample: false},
		{ProblemID: 1025, Input: "a\na\n", Output: "true", IsSample: false},
		// 1026 - Sort Array
		{ProblemID: 1026, Input: "6\n5 2 3 1 4 6\n", Output: "1 2 3 4 5 6", IsSample: true},
		{ProblemID: 1026, Input: "3\n3 2 1\n", Output: "1 2 3", IsSample: true},
		{ProblemID: 1026, Input: "5\n-1 0 2 -5 10\n", Output: "-5 -1 0 2 10", IsSample: false},
		{ProblemID: 1026, Input: "1\n42\n", Output: "42", IsSample: false},
		// 1027 - Valid Palindrome
		{ProblemID: 1027, Input: "A man, a plan, a canal: Panama\n", Output: "true", IsSample: true},
		{ProblemID: 1027, Input: "race a car\n", Output: "false", IsSample: true},
		{ProblemID: 1027, Input: ".,\n", Output: "true", IsSample: false},
		{ProblemID: 1027, Input: "0P\n", Output: "false", IsSample: false},
		// 1028 - Best Time to Buy and Sell Stock
		{ProblemID: 1028, Input: "6\n7 1 5 3 6 4\n", Output: "5", IsSample: true},
		{ProblemID: 1028, Input: "5\n7 6 4 3 1\n", Output: "0", IsSample: true},
		{ProblemID: 1028, Input: "3\n1 2 4\n", Output: "3", IsSample: false},
		{ProblemID: 1028, Input: "4\n3 2 6 5\n", Output: "4", IsSample: false},
	}

	for _, tc := range cases {
		database.DB.Create(&tc)
	}
}

func seedContests() {
	var count int64
	database.DB.Model(&models.Contest{}).Count(&count)
	if count > 0 {
		return
	}

	now := time.Now()
	contests := []models.Contest{
		{
			Title: "GOOJ 春季周赛", StartAt: now.Add(-2 * time.Hour), EndAt: now.Add(3 * time.Hour),
			Status: "Running", ProblemIDs: "1001,1002,1003,1004,1005",
		},
		{
			Title: "GOOJ 算法入门赛", StartAt: now.Add(24 * time.Hour), EndAt: now.Add(48 * time.Hour),
			Status: "Upcoming", ProblemIDs: "1006,1007,1008,1009,1010",
		},
		{
			Title: "GOOJ 动态规划专题", StartAt: now.Add(-48 * time.Hour), EndAt: now.Add(-24 * time.Hour),
			Status: "Ended", ProblemIDs: "1012,1005,1028",
		},
	}

	for _, c := range contests {
		database.DB.Create(&c)
	}
}
