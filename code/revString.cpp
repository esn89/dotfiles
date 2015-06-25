#include <iostream>
#include <stack>

using namespace std;

char* revString(char* s) {

	// This handles null pointers
	if (s == NULL) return NULL;

	int i = 0;
	stack<char> cont;

	while (s[i] != '\0') {
		cont.push(s[i]);
		i++;
	}

	char* rev = new char[i];
	i = 0;
	while (cont.empty() == false) {
		char temp = cont.top();

		rev[i] = temp;
		cont.pop();
		i++;
	}
	rev[i] = '\0';
	return rev;
}

int main() {
	// NULL Pointer Case
	char * test = NULL;
	cout << revString(test) << endl;

	// Just a pointer

	//char * t;
	//cout << revString(t) << endl;


	//char myword[] = "asdf";
	//cout << revString(myword) << endl;

	return 0;
}



