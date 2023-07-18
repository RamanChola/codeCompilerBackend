#include<iostream>
#include<algorithm>
using namespace std;

int main()
{
    int cnt = 0;
    int arr[5];
    for (int i = 0; i < 4; ++i)
        cin >> arr[i];
    sort(arr, arr + 4);
    for (int i = 1; i < 4; ++i)
        if (arr[i] == arr[i - 1])
            cnt++;
    cout << cnt;
    return 0;
}